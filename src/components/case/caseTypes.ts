import type { CASE_STUDY_QUERY_RESULT } from "../../../sanity.types";

export type CaseData = NonNullable<CASE_STUDY_QUERY_RESULT>;
export type CaseDoc = { _id: string; _type: string };
export type ChapterData = NonNullable<CaseData["chapters"]>[number];
