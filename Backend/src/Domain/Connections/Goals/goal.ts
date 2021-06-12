import { v4 as uuid } from 'uuid';
import { Parsable, ResponseMsg } from '../../../response';
import GoalData from '../../../Service/DataObjects/goal-data';
import GoalStatus, { InProgress } from './goal-status';

export default class Goal implements Parsable<Goal, GoalData> {
	private _goal: string;
	private _id: string;
	private _reward: number;
	private _status: GoalStatus;

	constructor(goal: string, reward: number) {
		this._goal = goal;
		this._id = uuid();
		this._reward = reward;
		this._status = new InProgress(this);
	}

	get id(): string {
		return this._id;
	}

	set reward(reward: number) {
		this._reward = reward;
	}

	set status(status: GoalStatus) {
		this._status = status;
	}

	parse(): GoalData {
		return new GoalData(this._goal, this._reward, this._id);
	}
	getData(): Goal {
		return this;
	}

	complete(): ResponseMsg<null> {
		return this._status.complete();
	}
	incomplete(): ResponseMsg<null> {
		return this._status.incomplete();
	}
	approve(): ResponseMsg<null> {
		return this._status.approve();
	}
}
