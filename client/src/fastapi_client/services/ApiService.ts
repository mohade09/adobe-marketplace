/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cluster } from '../models/Cluster';
import type { JobDefinition } from '../models/JobDefinition';
import type { JobRun } from '../models/JobRun';
import type { JobSubmissionRequest } from '../models/JobSubmissionRequest';
import type { JobSubmissionResponse } from '../models/JobSubmissionResponse';
import type { UserInfo } from '../models/UserInfo';
import type { UserWorkspaceInfo } from '../models/UserWorkspaceInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiService {
    /**
     * Get Current User
     * Get current user information from Databricks.
     * @returns UserInfo Successful Response
     * @throws ApiError
     */
    public static getCurrentUserApiUserMeGet(): CancelablePromise<UserInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/me',
        });
    }
    /**
     * Get User Workspace Info
     * Get user information along with workspace details.
     * @returns UserWorkspaceInfo Successful Response
     * @throws ApiError
     */
    public static getUserWorkspaceInfoApiUserMeWorkspaceGet(): CancelablePromise<UserWorkspaceInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user/me/workspace',
        });
    }
    /**
     * List Job Runs
     * List job runs with optional status filtering.
     * @param statusFilter Filter by status: PENDING, RUNNING, SUCCEEDED, FAILED, CANCELLED
     * @param limit Maximum number of runs to return
     * @returns JobRun Successful Response
     * @throws ApiError
     */
    public static listJobRunsApiJobsRunsGet(
        statusFilter?: (string | null),
        limit: number = 25,
    ): CancelablePromise<Array<JobRun>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/runs',
            query: {
                'status_filter': statusFilter,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Job Definitions
     * List available job definitions.
     * @param limit Maximum number of jobs to return
     * @returns JobDefinition Successful Response
     * @throws ApiError
     */
    public static listJobDefinitionsApiJobsDefinitionsGet(
        limit: number = 25,
    ): CancelablePromise<Array<JobDefinition>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/definitions',
            query: {
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Clusters
     * List available clusters.
     * @returns Cluster Successful Response
     * @throws ApiError
     */
    public static listClustersApiJobsClustersGet(): CancelablePromise<Array<Cluster>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/clusters',
        });
    }
    /**
     * Submit Job
     * Submit a job to run on a cluster.
     * @param requestBody
     * @returns JobSubmissionResponse Successful Response
     * @throws ApiError
     */
    public static submitJobApiJobsSubmitPost(
        requestBody: JobSubmissionRequest,
    ): CancelablePromise<JobSubmissionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/jobs/submit',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Job Definition
     * Get job definition by ID.
     * @param jobId
     * @returns JobDefinition Successful Response
     * @throws ApiError
     */
    public static getJobDefinitionApiJobsJobIdGet(
        jobId: number,
    ): CancelablePromise<JobDefinition> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}',
            path: {
                'job_id': jobId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Job Runs
     * Get runs for a specific job.
     * @param jobId
     * @param limit Maximum number of runs to return
     * @returns JobRun Successful Response
     * @throws ApiError
     */
    public static getJobRunsApiJobsJobIdRunsGet(
        jobId: number,
        limit: number = 10,
    ): CancelablePromise<Array<JobRun>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/{job_id}/runs',
            path: {
                'job_id': jobId,
            },
            query: {
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Job Run
     * Get specific run details.
     * @param runId
     * @returns JobRun Successful Response
     * @throws ApiError
     */
    public static getJobRunApiJobsRunsRunIdGet(
        runId: number,
    ): CancelablePromise<JobRun> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/jobs/runs/{run_id}',
            path: {
                'run_id': runId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
