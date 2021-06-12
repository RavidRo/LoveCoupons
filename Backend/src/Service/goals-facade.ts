import Members from '../Domain/Connections/members';
import { ResponseMsg } from '../response';
import Singleton from '../singleton';
import GoalData from './DataObjects/goal-data';

export default class GoalsFacade extends Singleton {
	private members: Members;

	constructor() {
		super();
		this.members = new Members();
	}

	addGoalToPartner(
		myUID: string,
		partnerUID: string,
		goal: string,
		reward: number
	): ResponseMsg<string> {
		return this.members.onMember(myUID, (member) =>
			member.addGoalToPartner(partnerUID, goal, reward)
		);
	}

	getMyGoals(myUID: string, partnerUID: string): ResponseMsg<GoalData[]> {
		return this.members.onMember(myUID, (member) => member.getMyGoals(partnerUID));
	}

	removeGoal(myUID: string, partnerUID: string, goalID: string): ResponseMsg<null> {
		return this.members.onMember(myUID, (member) => member.removeGoal(partnerUID, goalID));
	}

	setGoalReward(
		myUID: string,
		partnerUID: string,
		goalID: string,
		reward: number
	): ResponseMsg<null> {
		return this.members.onMember(myUID, (member) =>
			member.setGoalReward(partnerUID, goalID, reward)
		);
	}
}