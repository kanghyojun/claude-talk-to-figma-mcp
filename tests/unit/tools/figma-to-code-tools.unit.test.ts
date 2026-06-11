import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerFigmaToCodeTools } from "../../../src/talk_to_figma_mcp/tools/figma-to-code-tools";

jest.mock("../../../src/talk_to_figma_mcp/utils/websocket", () => ({
  sendCommandToFigma: jest.fn(),
}));

describe("figma-to-code tools unit", () => {
  let server: McpServer;
  let mockSendCommand: jest.Mock;
  const handlers: Record<string, Function> = {};
  const schemas: Record<string, z.ZodObject<any>> = {};

  beforeEach(() => {
    server = new McpServer(
      { name: "test-server", version: "1.0.0" },
      { capabilities: { tools: {} } },
    );

    mockSendCommand = require("../../../src/talk_to_figma_mcp/utils/websocket").sendCommandToFigma;
    mockSendCommand.mockReset();
    mockSendCommand.mockResolvedValue({
      framework: "Tailwind",
      code: "<div />",
      warnings: [],
    });

    const originalTool = server.tool.bind(server);
    jest.spyOn(server, "tool").mockImplementation((...args: any[]) => {
      if (args.length === 4) {
        const [name, _description, schema, handler] = args;
        handlers[name] = handler;
        schemas[name] = z.object(schema);
      }
      return (originalTool as any)(...args);
    });

    registerFigmaToCodeTools(server);
  });

  async function callTool(name: string, args: any) {
    const validatedArgs = schemas[name].parse(args);
    return handlers[name](validatedArgs, { meta: {} });
  }

  it("forwards conversion settings to the Figma plugin", async () => {
    await callTool("figma_to_code", {
      framework: "Tailwind",
      nodeIds: ["1:2"],
      settings: { tailwindGenerationMode: "jsx", showLayerNames: true },
      maxNodeCount: 250,
    });

    expect(mockSendCommand).toHaveBeenCalledWith("figma_to_code", {
      framework: "Tailwind",
      nodeIds: ["1:2"],
      settings: { tailwindGenerationMode: "jsx", showLayerNames: true },
      maxNodeCount: 250,
    });
  });

  it("returns converted code response text", async () => {
    const result = await callTool("figma_to_code", {
      framework: "HTML",
    });

    expect(result.content[0].text).toContain('"code": "<div />"');
  });

  it("surfaces websocket errors", async () => {
    mockSendCommand.mockRejectedValueOnce(new Error("plugin offline"));

    const result = await callTool("figma_to_code", {
      framework: "HTML",
    });

    expect(result.content[0].text).toBe("Error converting Figma to code: plugin offline");
  });
});
