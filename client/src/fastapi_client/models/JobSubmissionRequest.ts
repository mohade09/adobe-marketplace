/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request model for job submission
 */
export type JobSubmissionRequest = {
    job_id: number;
    cluster_id?: (string | null);
    notebook_params?: (Record<string, any> | null);
    jar_params?: null;
    python_params?: null;
};

