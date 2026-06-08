/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Model for job run information
 */
export type JobRun = {
    run_id: number;
    job_id: number;
    job_name: string;
    status: string;
    start_time: (string | null);
    end_time: (string | null);
    cluster_id: (string | null);
    cluster_name: (string | null);
    run_duration: (number | null);
};

