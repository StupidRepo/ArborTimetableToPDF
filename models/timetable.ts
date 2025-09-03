// deno-lint-ignore-file no-namespace
import {API_V1_BASE_URL, Networking} from "../consts.ts";
import {SchoolLogin} from "./login.ts";

export namespace Timetable {
	export interface TimetableItem {
		startDatetime: string; // ISO 8601 datetime (YYYY-MM-DD HH:mm:ss)
		endDatetime: string;   // ISO 8601 datetime (YYYY-MM-DD HH:mm:ss)

		title: string;
		location: string;

		type: string; // e.g. "Lesson", "Detention", "Event"

		extraDetails: {
			teacher?: string;
		};
	}

	export interface Day {
		date: string; // ISO 8601 date (YYYY-MM-DD)
		items: TimetableItem[];
	}

	export interface Response {
		start_date: string; // ISO 8601 date (YYYY-MM-DD)
		end_date: string;   // ISO 8601 date (YYYY-MM-DD)
		items: Day[];
	}

	export async function getTimetable(session: SchoolLogin.Response, startDate: string, endDate: string): Promise<Timetable.Response> {
		return await Networking.doAuthedNetworkRequest<Timetable.Response>(session, "GET", API_V1_BASE_URL + `calendar?startDate=${startDate}&endDate=${endDate}`, undefined);
	}
}