import { roundToNearestHundreth } from "./../../common/numToAutoFixed";
import { addWarning } from "../../common/commonConversionWarnings";
import { numberToFixedString } from "../../common/numToAutoFixed";
import { formatWithJSX } from "../../common/parseJSX";

/**
 * https://tailwindcss.com/docs/opacity/
 * default is [0, 25, 50, 75, 100], but '100' will be ignored:
 * if opacity was changed, let it be visible. Therefore, 98% => 75
 * node.opacity is between [0, 1]; output will be [0, 100]
 */
export const htmlOpacity = (
  node: MinimalBlendMixin,
  isJsx: boolean,
): string => {
  // [when testing] node.opacity can be undefined
  if (node.opacity !== undefined && node.opacity !== 1) {
    // formatWithJSX is not called here because opacity unit doesn't end in px.
    if (isJsx) {
      return `opacity: ${numberToFixedString(node.opacity)}`;
    } else {
      return `opacity: ${numberToFixedString(node.opacity)}`;
    }
  }
  return "";
};

export const htmlBlendMode = (
  node: MinimalBlendMixin,
  isJsx: boolean,
): string => {
  if (node.blendMode !== "NORMAL" && node.blendMode !== "PASS_THROUGH") {
    let blendMode = "";
    switch (node.blendMode) {
      case "MULTIPLY":
        blendMode = "multiply";
        break;
      case "SCREEN":
        blendMode = "screen";
        break;
      case "OVERLAY":
        blendMode = "overlay";
        break;
      case "DARKEN":
        blendMode = "darken";
        break;
      case "LIGHTEN":
        blendMode = "lighten";
        break;
      case "COLOR_DODGE":
        blendMode = "color-dodge";
        break;
      case "COLOR_BURN":
        blendMode = "color-burn";
        break;
      case "HARD_LIGHT":
        blendMode = "hard-light";
        break;
      case "SOFT_LIGHT":
        blendMode = "soft-light";
        break;
      case "DIFFERENCE":
        blendMode = "difference";
        break;
      case "EXCLUSION":
        blendMode = "exclusion";
        break;
      case "HUE":
        blendMode = "hue";
        break;
      case "SATURATION":
        blendMode = "saturation";
        break;
      case "COLOR":
        blendMode = "color";
        break;
      case "LUMINOSITY":
        blendMode = "luminosity";
        break;
    }

    if (blendMode) {
      return formatWithJSX("mix-blend-mode", isJsx, blendMode);
    }
  }
  return "";
};

/**
 * https://tailwindcss.com/docs/visibility/
 * example: invisible
 */
export const htmlVisibility = (
  node: SceneNodeMixin,
  isJsx: boolean,
): string => {
  // [when testing] node.visible can be undefined

  // When something is invisible in Figma, it isn't gone. Groups can make use of it.
  // Therefore, instead of changing the visibility (which causes bugs in nested divs),
  // this plugin is going to ignore color and stroke
  if (node.visible !== undefined && !node.visible) {
    return formatWithJSX("visibility", isJsx, "hidden");
  }
  return "";
};

/**
 * https://tailwindcss.com/docs/rotate/
 * default is [-180, -90, -45, 0, 45, 90, 180], but '0' will be ignored:
 * if rotation was changed, let it be perceived. Therefore, 1 => 45
 */
export const htmlRotation = (node: LayoutMixin, isJsx: boolean): string[] => {
  // For some reason, a group with rotation also has rotated nodes.
  // - group 1 - rotation 45°
  //   - child 1 - rotation 45°
  //
  // if the child is also rotated 45° the effect is doubled
  // - group 1 - rotation 45°
  //   - child 1 - rotation 90°
  //
  // because of this, we subtract the rotation of the parent from the children.
  const parent =
    "parent" in node && node.parent ? (node.parent as LayoutMixin) : null;
  const parentRotation: number =
    parent && "rotation" in parent ? parent.rotation : 0;
  const rotation: number = Math.round(parentRotation - node.rotation) ?? 0;

  if (
    roundToNearestHundreth(parentRotation) !== 0 &&
    roundToNearestHundreth(rotation) !== 0
  ) {
    addWarning(
      "Rotated elements within rotated containers are not currently supported.",
    );
  }

  if (rotation !== 0) {
    return [
      formatWithJSX(
        "transform",
        isJsx,
        `rotate(${numberToFixedString(rotation)}deg)`,
      ),
      formatWithJSX("transform-origin", isJsx, "top left"),
    ];
  }
  return [];
};
