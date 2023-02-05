import * as github from '@actions/github';
import { makeConsoleLogger } from '@notionhq/client/build/src/logging';
import { Issue } from '../models/issue';
export class GithubAdapter {
    constructor(
        private readonly issueType?: string
    ) { }

    action() {

        console.info("github.context.payload.action : "+ github.context.payload.action)
        return github.context.payload.action || ''
    }

    getIssue() {
        if (!github.context.payload.issue) return new Issue({});

        console.info("github.context.payload.issue : "+ github.context.payload.issue)
        return new Issue(github.context.payload.issue);
    }

    async fetchAllIssues(token: string) {
        const octokit = github.getOctokit(token);


        console.info("fetchAllIssues owner : "+github.context.repo.owner);
        console.info("fetchAllIssues repo : "+github.context.repo.repo);
        console.info("fetchAllIssues state : "+this.prepareIssueType());
        const issues: Array<Issue> = await octokit.paginate('GET /repos/{owner}/{repo}/issues', {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            per_page: 100,
            state: this.prepareIssueType()
        }, response => response.data.map(issue => new Issue(issue)));
        
        issues.forEach(issue => {
            console.info("Issue : "+issue)
        });

        return issues;
    }

    private prepareIssueType() {
        if (this.issueType === 'all') {
            return 'all'
        }

        if (this.issueType === 'close') {
            return 'closed'
        }

        return 'open'
    }
}