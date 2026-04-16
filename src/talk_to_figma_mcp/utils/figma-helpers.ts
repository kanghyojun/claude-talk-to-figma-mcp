/**
 * Utilidades para el procesamiento de nodos y respuestas de Figma
 */

/**
 * Convierte un color RGBA a formato hexadecimal.
 * @param color - El color en formato RGBA con valores entre 0 y 1
 * @returns El color en formato hexadecimal (#RRGGBBAA)
 */
export function rgbaToHex(color: any): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a === 255 ? '' : a.toString(16).padStart(2, '0')}`;
}

/**
 * Filtra un nodo de Figma para reducir su complejidad y tamaño.
 * Convierte colores a formato hexadecimal y elimina datos innecesarios.
 * @param node - El nodo de Figma a filtrar
 * @returns El nodo filtrado o null si debe ser ignorado
 */
export function filterFigmaNode(node: any) {
  // Skip VECTOR type nodes
  if (node.type === "VECTOR") {
    return null;
  }

  const filtered: any = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  if (node.fills && node.fills.length > 0) {
    filtered.fills = node.fills.map((fill: any) => {
      const processedFill = { ...fill };

      // Remove boundVariables and imageRef
      delete processedFill.boundVariables;
      delete processedFill.imageRef;

      // Process gradientStops if present
      if (processedFill.gradientStops) {
        processedFill.gradientStops = processedFill.gradientStops.map((stop: any) => {
          const processedStop = { ...stop };
          // Convert color to hex if present
          if (processedStop.color) {
            processedStop.color = rgbaToHex(processedStop.color);
          }
          // Remove boundVariables
          delete processedStop.boundVariables;
          return processedStop;
        });
      }

      // Convert solid fill colors to hex
      if (processedFill.color) {
        processedFill.color = rgbaToHex(processedFill.color);
      }

      return processedFill;
    });
  }

  if (node.strokes && node.strokes.length > 0) {
    filtered.strokes = node.strokes.map((stroke: any) => {
      const processedStroke = { ...stroke };
      // Remove boundVariables
      delete processedStroke.boundVariables;
      // Convert color to hex if present
      if (processedStroke.color) {
        processedStroke.color = rgbaToHex(processedStroke.color);
      }
      return processedStroke;
    });
  }

  if (node.effects && node.effects.length > 0) {
    filtered.effects = node.effects.map((effect: any) => {
      const processedEffect = { ...effect };
      // Remove boundVariables
      delete processedEffect.boundVariables;
      // Convert color to hex if present (for shadow effects)
      if (processedEffect.color) {
        processedEffect.color = rgbaToHex(processedEffect.color);
      }
      return processedEffect;
    });
  }

  if (node.cornerRadius !== undefined) {
    filtered.cornerRadius = node.cornerRadius;
  }

  if (node.absoluteBoundingBox) {
    filtered.absoluteBoundingBox = node.absoluteBoundingBox;
  }

  if (node.localPosition) {
    filtered.localPosition = node.localPosition;
  }

  if (node.characters) {
    filtered.characters = node.characters;
  }

  if (node.style) {
    filtered.style = {
      fontFamily: node.style.fontFamily,
      fontStyle: node.style.fontStyle,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      textAlignHorizontal: node.style.textAlignHorizontal,
      letterSpacing: node.style.letterSpacing,
      lineHeightPx: node.style.lineHeightPx
    };
  }

  // Pass through auto-layout properties (from JSON_REST_V1 export)
  if (node.layoutMode && node.layoutMode !== "NONE") {
    filtered.layoutMode = node.layoutMode;
    if (node.itemSpacing !== undefined) filtered.itemSpacing = node.itemSpacing;
    if (node.counterAxisSpacing !== undefined) filtered.counterAxisSpacing = node.counterAxisSpacing;
    if (node.paddingLeft) filtered.paddingLeft = node.paddingLeft;
    if (node.paddingRight) filtered.paddingRight = node.paddingRight;
    if (node.paddingTop) filtered.paddingTop = node.paddingTop;
    if (node.paddingBottom) filtered.paddingBottom = node.paddingBottom;
    if (node.primaryAxisAlignItems) filtered.primaryAxisAlignItems = node.primaryAxisAlignItems;
    if (node.counterAxisAlignItems) filtered.counterAxisAlignItems = node.counterAxisAlignItems;
    if (node.layoutWrap) filtered.layoutWrap = node.layoutWrap;
    if (node.counterAxisAlignContent) filtered.counterAxisAlignContent = node.counterAxisAlignContent;
  }

  if (node.layoutSizingHorizontal) {
    filtered.layoutSizingHorizontal = node.layoutSizingHorizontal;
  }

  if (node.layoutSizingVertical) {
    filtered.layoutSizingVertical = node.layoutSizingVertical;
  }

  if (node.children) {
    filtered.children = node.children
      .map((child: any) => filterFigmaNode(child))
      .filter((child: any) => child !== null); // Remove null children (VECTOR nodes)
  }

  // Add componentProperties for INSTANCE nodes
  if (node.componentProperties) {
    filtered.componentProperties = node.componentProperties;
  }

  // Add mainComponentId for INSTANCE nodes
  if (node.mainComponentId) {
    filtered.mainComponentId = node.mainComponentId;
  }

  // Add componentPropertyDefinitions for COMPONENT nodes
  if (node.componentPropertyDefinitions) {
    filtered.componentPropertyDefinitions = node.componentPropertyDefinitions;
  }

  return filtered;
}

/**
 * Convert global coordinates to local coordinates relative to a parent
 */
export function globalToLocal(
  globalX: number,
  globalY: number,
  parentGlobalX: number = 0,
  parentGlobalY: number = 0
): { x: number; y: number } {
  return {
    x: globalX - parentGlobalX,
    y: globalY - parentGlobalY
  };
}

/**
 * Convert local coordinates to global coordinates
 */
export function localToGlobal(
  localX: number,
  localY: number,
  parentGlobalX: number = 0,
  parentGlobalY: number = 0
): { x: number; y: number } {
  return {
    x: localX + parentGlobalX,
    y: localY + parentGlobalY
  };
}

/**
 * Procesa un nodo de respuesta de Figma para propósitos de logging.
 * @param result - El resultado a procesar
 * @returns El resultado original sin modificaciones
 */
export function processFigmaNodeResponse(result: unknown): any {
  if (!result || typeof result !== "object") {
    return result;
  }

  // Check if this looks like a node response
  const resultObj = result as Record<string, unknown>;
  if ("id" in resultObj && typeof resultObj.id === "string") {
    // It appears to be a node response, log the details
    console.info(
      `Processed Figma node: ${resultObj.name || "Unknown"} (ID: ${resultObj.id})`
    );

    if ("x" in resultObj && "y" in resultObj) {
      console.debug(`Node position: (${resultObj.x}, ${resultObj.y})`);
    }

    if ("width" in resultObj && "height" in resultObj) {
      console.debug(`Node dimensions: ${resultObj.width}×${resultObj.height}`);
    }
  }

  return result;
}