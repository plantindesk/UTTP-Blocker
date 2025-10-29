import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import scrapeComments from "../../content/comment-scraper";

// Helper function to create a mock DOM element
const createMockElement = (
	properties: Record<string, unknown>,
	children: Record<string, unknown> = {},
	removeFn = vi.fn(),
) => {
	const element = {
		...properties,
		querySelector: (selector: string) => children[selector] || null,
		remove: removeFn,
	};
	return element;
};

describe("scrapeComments", () => {
	beforeEach(() => {
		// Stub the global document object before each test
		const mockDocument = {
			querySelectorAll: vi.fn(),
		};
		// biome-ignore lint/suspicious/noExplicitAny: Intentionally mocking global objects for testing
		globalThis.document = mockDocument as any;
	});

	afterEach(() => {
		// Restore the original document object after each test
		delete (globalThis as any).document;
	});

	it("should scrape and return comments correctly", () => {
		const mockComments = [
			createMockElement(
				{},
				{
					"#author-text": createMockElement({ innerText: "Author 1" }),
					"#content-text": createMockElement({ innerText: "Comment 1" }),
				},
			),
			createMockElement(
				{},
				{
					"#author-text": createMockElement({ innerText: "Author 2" }),
					"#content-text": createMockElement({ innerText: "Comment 2" }),
				},
			),
		];

		(document.querySelectorAll as Mock).mockReturnValue(mockComments);

		const result = scrapeComments();

		expect(result).toEqual([
			{ author: "Author 1", commentText: "Comment 1" },
			{ author: "Author 2", commentText: "Comment 2" },
		]);
		expect(document.querySelectorAll).toHaveBeenCalledWith(
			"ytd-comment-view-model, ytd-comment-renderer",
		);
	});

	it("should filter out blocked authors and remove their comments from the DOM", () => {
		const removeMock = vi.fn();
		const mockComments = [
			createMockElement(
				{},
				{
					"#author-text": createMockElement({ innerText: "Author 1" }),
					"#content-text": createMockElement({ innerText: "Good comment" }),
				},
			),
			createMockElement(
				{},
				{
					"#author-text": createMockElement({ innerText: "@UTTP-BlockedUser" }),
					"#content-text": createMockElement({ innerText: "Blocked comment" }),
				},
				removeMock,
			),
		];

		(document.querySelectorAll as Mock).mockReturnValue(mockComments);

		const result = scrapeComments();

		expect(result).toEqual([
			{ author: "Author 1", commentText: "Good comment" },
		]);
		expect(removeMock).toHaveBeenCalledOnce();
	});

	it("should return an empty array if no comments are found", () => {
		(document.querySelectorAll as Mock).mockReturnValue([]);
		const result = scrapeComments();
		expect(result).toEqual([]);
	});

	it("should handle comment elements that are missing author or text", () => {
		const mockComments = [
			createMockElement(
				{},
				{
					"#content-text": createMockElement({
						innerText: "Comment without author",
					}),
				},
			),
			createMockElement(
				{},
				{
					"#author-text": createMockElement({
						innerText: "Author without comment",
					}),
				},
			),
			createMockElement(
				{},
				{
					"#author-text": createMockElement({ innerText: "Valid Author" }),
					"#content-text": createMockElement({ innerText: "Valid Comment" }),
				},
			),
		];

		(document.querySelectorAll as Mock).mockReturnValue(mockComments);

		const result = scrapeComments();

		expect(result).toEqual([
			{ author: "Valid Author", commentText: "Valid Comment" },
		]);
	});
});
