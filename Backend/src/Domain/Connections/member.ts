import { makeFail, makeGood, makeGoodArrPa, ResponseMsg } from '../../response';
import CouponData from '../../Service/DataObjects/coupon-data';
import PartnerData from '../../Service/DataObjects/partner-data';
import ConnectionSettings from './connection-settings';
import Coupon from './Coupon';
import Invitation from './invitation';

export default class Member {
	private _invitations: { [senderUID: string]: Invitation };
	private _uid: string;
	private _nickname: string;
	private connections: { [partnerUID: string]: ConnectionSettings };

	constructor(uid: string, nickname: string) {
		this._uid = uid;
		this._invitations = {};
		this._nickname = nickname;
		this.connections = {};
	}

	get uid(): string {
		return this._uid;
	}
	get nickname(): string {
		return this._nickname;
	}

	get invitations(): Invitation[] {
		return Object.values(this._invitations);
	}

	invite(sender: Member): ResponseMsg<null> {
		if (this.connections[sender.uid]) {
			return makeFail('You are already partners');
		}
		if (!this._invitations[sender.uid]) {
			const invitation = new Invitation(this._uid, sender);
			this._invitations[sender.uid] = invitation;
		}
		return makeGood();
	}

	acceptInvitation(inviterUID: string): ResponseMsg<null> {
		if (!this._invitations[inviterUID]) {
			return makeFail('Has no invitation from the given user');
		}

		const mySettings = this._invitations[inviterUID].accept(this.nickname);
		this.connections[inviterUID] = mySettings;

		return this.removeInvitation(inviterUID);
	}

	leavePartner(partnerUID: string): ResponseMsg<null> {
		if (!this.connections[partnerUID]) {
			return makeFail('You do not have a connection with given member');
		}
		delete this.connections[partnerUID];
		return makeGood();
	}

	addConnection(partnerUID: string, connection: ConnectionSettings): void {
		if (this.connections[partnerUID]) {
			throw new Error('Can not redeclare connections');
		}
		this.connections[partnerUID] = connection;
	}

	getPartners(): PartnerData[] {
		const partners = Object.keys(this.connections).map((partnerUID) => {
			return new PartnerData(partnerUID, this.connections[partnerUID].partnerNickname);
		});
		return partners;
	}

	rejectInvitation(toRejectUID: string): ResponseMsg<null> {
		if (!this._invitations[toRejectUID]) {
			return makeFail('Has no invitation from the given user');
		}

		return this.removeInvitation(toRejectUID);
	}

	hasInvitation(fromUID: string): boolean {
		return this._invitations[fromUID] !== undefined;
	}

	createCoupon(partnerUID: string, content: string): ResponseMsg<string> {
		if (!this.connections[partnerUID]) {
			return makeFail('You do not have a connection with given member');
		}
		return this.connections[partnerUID].onPartner((partner) => partner.createCoupon(content));
	}

	getPartnersBank(partnerUID: string): ResponseMsg<Coupon[], CouponData[]> {
		if (!this.connections[partnerUID]) {
			return makeFail('You do not have a connection with given member');
		}
		return this.connections[partnerUID].onPartner((partner) =>
			makeGoodArrPa(partner.availableCoupons)
		);
	}

	removeCoupon(partnerUID: string, couponId: string): ResponseMsg<null> {
		if (!this.connections[partnerUID]) {
			return makeFail('You do not have a connection with given member');
		}
		return this.connections[partnerUID].onPartner((partner) => partner.removeCoupon(couponId));
	}

	private removeInvitation(uid: string): ResponseMsg<null> {
		delete this._invitations[uid];
		return makeGood();
	}
}
