import * as github from '@actions/github';
import { makeConsoleLogger } from '@notionhq/client/build/src/logging';
import { Issue } from '../models/issue';
export class GithubAdapter {
    constructor(
        private readonly issueType?: string
    ) { }

    action() {
        return github.context.payload.action || ''
    }

    getIssue() {
        if (!github.context.payload.issue) return new Issue({});

        console.log("github.context.payload.issue : "+ github.context.payload.issue)
        return new Issue(github.context.payload.issue);
    }

    async fetchAllIssues(token: string) {
        const octokit = github.getOctokit(token);


        console.log("fetchAllIssues owner : "+github.context.repo.owner);
        console.log("fetchAllIssues repo : "+github.context.repo.repo);
        console.log("fetchAllIssues state : "+this.prepareIssueType());
        const issues: Array<Issue> = await octokit.paginate('GET /repos/{owner}/{repo}/issues', {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            per_page: 100,
            state: this.prepareIssueType()
        }, response => response.data.map(issue => new Issue(issue)));
        
        issues.forEach(issue => {
            console.log("Issue : "+issue)
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