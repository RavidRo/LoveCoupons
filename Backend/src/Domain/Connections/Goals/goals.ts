import { makeFail, makeGood, ResponseMsg } from '../../../response';
import Goal from './goal';

export default class Goals {
	private _goals: { [id: string]: Goal };

	constructor() {
		this._goals = {};
	}

	get goals(): Goal[] {
		return Object.values(this._goals);
	}

	private validateReward(reward: number): ResponseMsg<null> {
		if (reward < 0) {
			return makeFail('Can not set negative points as the goal reward');
		}
		if (!Number.isInteger(reward)) {
			return makeFail('A goal reward must be a full number');
		}
		return makeGood();
	}

	addGoal(goal: string, reward: number): ResponseMsg<string> {
		if (goal === '') {
			return makeFail('Goal can not be empty');
		}
		const response = this.validateReward(reward);
		if (!response.isSuccess()) {
			return makeFail(response.getError());
		}
		const newGoal = new Goal(goal, reward);
		this._goals[newGoal.id] = newGoal;
		return makeGood(newGoal.id);
	}

	removeGoal(goalID: string): ResponseMsg<null> {
		if (!(goalID in this._goals)) {
			return makeFail('There is no goal corresponding to the given id');
		}
		delete this._goals[goalID];
		return makeGood();
	}

	setReward(goalID: string, reward: number): ResponseMsg<null> {
		if (!(goalID in this._goals)) {
			return makeFail('There is no goal corresponding to the given id');
		}
		const response = this.validateReward(reward);
		if (!response.isSuccess()) {
			return makeFail(response.getError());
		}
		this._goals[goalID].reward = reward;
		return makeGood();
	}

	onGoal<T, U = T>(goalID: string, func: (goal: Goal) => ResponseMsg<T, U>): ResponseMsg<T, U> {
		if (!(goalID in this._goals)) {
			return makeFail('There is no goal corresponding to the given id');
		}
		return func(this._goals[goalID]);
	}
}
