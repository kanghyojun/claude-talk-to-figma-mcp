import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerComponentTools } from "../../src/talk_to_figma_mcp/tools/component-tools";

jest.mock("../../src/talk_to_figma_mcp/utils/websocket", () => ({
  sendCommandToFigma: jest.fn(),
}));

describe("component tools integration", () => {
  let server: McpServer;
  let mockSendCommand: jest.Mock;
  const handlers: Record<string, Function> = {};
  const schemas: Record<string, z.ZodObject<any>> = {};

  beforeEach(() => {
    server = new McpServer(
      { name: "test-server", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    mockSendCommand = require("../../src/talk_to_figma_mcp/utils/websocket").sendCommandToFigma;
    mockSendCommand.mockReset();
    mockSendCommand.mockResolvedValue({ id: "node-id", name: "Node", key: "component-key", propertyType: "BOOLEAN", propertyName: "Enabled" });

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

  async function callToolWithValidation(name: string, args: any) {
    const validatedArgs = schemas[name].parse(args);
    return handlers[name](validatedArgs, { meta: {} });
  }

  it("create_component sends expected command payload", async () => {
    await callToolWithValidation("create_component", {
      name: "Button/Base",
      x: 120,
      y: 240,
      width: 320,
      height: 80,
    });

    expect(mockSendCommand).toHaveBeenCalledWith("create_component", {
      name: "Button/Base",
      x: 120,
      y: 240,
      width: 320,
      height: 80,
    });
  });

  it("add_component_property sends expected command payload", async () => {
    await callToolWithValidation("add_component_property", {
      componentId: "123:456",
      propertyName: "Enabled",
      propertyType: "BOOLEAN",
      defaultValue: true,
    });

    expect(mockSendCommand).toHaveBeenCalledWith("add_component_property", {
      componentId: "123:456",
      propertyName: "Enabled",
      propertyType: "BOOLEAN",
      defaultValue: true,
    });
  });

  it("set_properties sends expected command payload", async () => {
    await callToolWithValidation("set_properties", {
      instanceId: "456:789",
      properties: {
        Enabled: false,
        Size: "Large",
      },
    });

    expect(mockSendCommand).toHaveBeenCalledWith("set_properties", {
      instanceId: "456:789",
      properties: {
        Enabled: false,
        Size: "Large",
      },
    });
  });

  it("add_component_property rejects invalid propertyType", async () => {
    await expect(
      callToolWithValidation("add_component_property", {
        componentId: "123:456",
        propertyName: "Enabled",
        propertyType: "NUMBER",
      })
    ).rejects.toThrow();

    expect(mockSendCommand).not.toHaveBeenCalled();
  });
});
