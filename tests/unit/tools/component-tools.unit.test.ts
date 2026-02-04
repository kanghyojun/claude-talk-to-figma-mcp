import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerComponentTools } from "../../../src/talk_to_figma_mcp/tools/component-tools";

jest.mock("../../../src/talk_to_figma_mcp/utils/websocket", () => ({
  sendCommandToFigma: jest.fn(),
}));

describe("component tools unit", () => {
  let server: McpServer;
  let mockSendCommand: jest.Mock;
  const handlers: Record<string, Function> = {};
  const schemas: Record<string, z.ZodObject<any>> = {};

  beforeEach(() => {
    server = new McpServer(
      { name: "test-server", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    mockSendCommand = require("../../../src/talk_to_figma_mcp/utils/websocket").sendCommandToFigma;
    mockSendCommand.mockReset();
    mockSendCommand.mockResolvedValue({ id: "1:1", name: "Button", key: "K1", propertyName: "Size", propertyType: "VARIANT" });

    const originalTool = server.tool.bind(server);
    jest.spyOn(server, "tool").mockImplementation((...args: any[]) => {
      if (args.length === 4) {
        const [name, _description, schema, handler] = args;
        handlers[name] = handler;
        schemas[name] = z.object(schema);
      }
      return (originalTool as any)(...args);
    });

    registerComponentTools(server);
  });

  async function callTool(name: string, args: any) {
    const validatedArgs = schemas[name].parse(args);
    return handlers[name](validatedArgs, { meta: {} });
  }

  it("set_properties validates object and forwards payload", async () => {
    await callTool("set_properties", {
      instanceId: "22:4",
      properties: { Size: "Large", Enabled: true },
    });

    expect(mockSendCommand).toHaveBeenCalledWith("set_properties", {
      instanceId: "22:4",
      properties: { Size: "Large", Enabled: true },
    });
  });

  it("add_component_property rejects unsupported propertyType at schema level", async () => {
    await expect(
      callTool("add_component_property", {
        componentId: "10:2",
        propertyName: "State",
        propertyType: "NUMBER",
      })
    ).rejects.toThrow();
  });

  it("create_component_set returns variant count in message", async () => {
    mockSendCommand.mockResolvedValueOnce({
      id: "CS:1",
      name: "Button",
      key: "K2",
      variantCount: 4,
    });

    const result = await callTool("create_component_set", {
      componentIds: ["C:1", "C:2", "C:3", "C:4"],
    });

    expect(result.content[0].text).toBe(
      'Created component set "Button" with ID: CS:1, key: K2, containing 4 variants.'
    );
  });

  it("create_component returns error message for non-Error exceptions", async () => {
    mockSendCommand.mockRejectedValueOnce("unexpected failure");

    const result = await callTool("create_component", { name: "Card" });

    expect(result.content[0].text).toBe("Error creating component: unexpected failure");
  });
});
