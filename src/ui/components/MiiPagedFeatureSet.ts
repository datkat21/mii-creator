import Html from "@datkat21/html";
// import Mii from "../../external/mii-js/mii";
import Mii from "../../class/MiiData";
import { TabList, TabListType, type Tab } from "./TabList";
import md5 from "md5";
import { playSound } from "../../class/audio/SoundManager";
import { BodyUpdateType, MiiEditor, RenderPart } from "../../class/MiiEditor";

export enum FeatureSetType {
  Icon,
  Text,
  Range,
  Slider,
  Switch,
  Misc
}
export interface FeatureSetIconItem {
  type: FeatureSetType.Icon;
  part: RenderPart;
  sound?: string;
  icon?: string;
  color?: string;
  value: number | string;
  property?: string[] | string;
  selectedCondition?: () => boolean;
  preSelectCallback?: (tmpMii: Mii) => void;
  forceRender?: boolean;
  bodyUpdateType?: BodyUpdateType;
}
export interface FeatureSetTextItem {
  type: FeatureSetType.Text;
  part: RenderPart;
  property: string;
  label: string;
  sound?: string;
  forceRender?: boolean;
  bodyUpdateType?: BodyUpdateType;
}
export interface FeatureSetRangeItem {
  type: FeatureSetType.Range;
  part: RenderPart;
  iconStart: string;
  iconEnd: string;
  soundStart?: string;
  soundEnd?: string;
  min: number;
  max: number;
  property: string;
  label?: string;
  forceRender?: boolean;
  bodyUpdateType?: BodyUpdateType;
  inverse?: boolean;
}
export interface FeatureSetSliderItem {
  type: FeatureSetType.Slider;
  part: RenderPart;
  iconStart: string;
  iconEnd: string;
  soundStart?: string;
  soundEnd?: string;
  min: number;
  max: number;
  property: string;
  label?: string;
  forceRender?: boolean;
  bodyUpdateType?: BodyUpdateType;
}
export interface FeatureSetSwitchItem {
  type: FeatureSetType.Switch;
  part: RenderPart;
  iconOff: string;
  iconOn: string;
  soundOff?: string;
  soundOn?: string;
  property: string;
  forceRender?: boolean;
  bodyUpdateType?: BodyUpdateType;
  isNumber?: boolean;
}
export interface FeatureSetMiscItem {
  type: FeatureSetType.Misc;
  html: Html;
  select(): any | Promise<any>;
  // added to prevent error because lazy
  forceRender?: boolean;
  bodyUpdateType?: BodyUpdateType;
  part?: RenderPart;
}

export type FeatureSetItem =
  | FeatureSetIconItem
  | FeatureSetTextItem
  | FeatureSetRangeItem
  | FeatureSetSliderItem
  | FeatureSetSwitchItem
  | FeatureSetMiscItem;
export interface FeatureSetEntry {
  label: string;
  header?: Html | string;
  headerIsHtml?: boolean;
  items: FeatureSetItem[];
}

export interface FeatureSet {
  mii?: any;
  miiIsNotMii?: boolean;
  onChange: (
    mii: Mii,
    forceRender: boolean,
    part: RenderPart,
    updateType: BodyUpdateType
  ) => void;
  entries: Record<string, FeatureSetEntry>;
}

export const playHoverSound = () => playSound("hover");

export function MiiPagedFeatureSet(set: FeatureSet) {
  let tmpMii: Mii | any;
  if (set.mii)
    if (set.miiIsNotMii === undefined || set.miiIsNotMii === false)
      tmpMii = new Mii((set.mii as Mii).export());
    else tmpMii = set.mii;
  else tmpMii = {};

  let setContainer = new Html("div").class("feature-set-container");

  const tabListInit: Tab[] = [];

  for (const key in set.entries) {
    const entry = set.entries[key];

    let property = key;

    tabListInit.push({
      icon: entry.label,
      async select(content) {
        let setList = new Html("div")
          .class("feature-set-group")
          .appendTo(content);

        if (entry.header) {
          const header = new Html("div").class("feature-set-header");

          if (entry.headerIsHtml !== undefined) {
            header.append(entry.header);
          } else {
            header.text(entry.header as string);
          }

          setList.append(header);
        }

        if ("items" in entry) {
          for (const item of entry.items) {
            const id = md5(String(Math.random() * 21412855));

            let forceRender = true,
              updateType = BodyUpdateType.None;

            if (item.forceRender !== undefined) {
              if (item.forceRender === false) {
                forceRender = false;
              }
            }
            if (item.bodyUpdateType !== undefined) {
              if (item.bodyUpdateType !== BodyUpdateType.None) {
                updateType = item.bodyUpdateType;
              }
            }

            const update = () =>
              set.onChange(
                tmpMii,
                forceRender,
                item.part || RenderPart.Head,
                updateType
              );

            // Used for true values (Switch colors usually use this to save time)
            let value = (tmpMii as Record<string, any>)[property];

            switch (item.type) {
              case FeatureSetType.Icon:
                let iconSelected = false;

                // js moment again
                if (item.selectedCondition)
                  if (item.selectedCondition() === true) iconSelected = true;
                  else iconSelected = false;

                if (item.property) {
                  if (Array.isArray(item.property)) {
                    let tmpValue = (tmpMii as Record<string, any>)[
                      item.property[0]
                    ];
                    if (
                      item.property
                        .map((i) => tmpMii[i])
                        .every((i) => i === tmpValue)
                    )
                      value = tmpValue;
                    else {
                      value = false;
                      iconSelected = false;
                    }
                  } else value = (tmpMii as Record<string, any>)[item.property];
                }
                let featureItem = new Html("div")
                  .class("feature-item")
                  .on("pointerenter", playHoverSound)
                  .on("click", async () => {
                    let value;

                    // i hate this
                    if (MiiEditor.getCurrentEditor() !== null) {
                      tmpMii = MiiEditor.getCurrentEditor()!.mii;
                    }

                    value = (tmpMii as Record<string, any>)[property];
                    const newValue = item.value;

                    if (item.selectedCondition)
                      if (item.selectedCondition() === true)
                        iconSelected = true;
                      else iconSelected = false;

                    console.log(
                      `condition check: value (${value}) === newValue (${newValue}), iconSelected (${iconSelected})`
                    );

                    // PREVENT DUPLICATE UPDATES
                    if (value === newValue || iconSelected) return;

                    if (item.preSelectCallback) item.preSelectCallback(tmpMii);

                    if (item.property) {
                      if (Array.isArray(item.property)) {
                        for (const prop of item.property) {
                          (tmpMii as Record<string, any>)[prop] = newValue;
                        }
                      } else {
                        (tmpMii as Record<string, any>)[item.property] =
                          newValue;
                      }
                    } else {
                      (tmpMii as Record<string, any>)[key] = newValue;
                    }

                    update();
                    if (item.sound) playSound(item.sound);
                    else if (item.color) playSound("select_color");
                    else if (item.icon) playSound("select_part");
                    setList
                      .qsa(".feature-item")!
                      .forEach((i) => i!.classOff("active"));
                    featureItem.classOn("active");
                  })
                  .appendTo(setList);
                if (item.icon) {
                  featureItem.html(item.icon);
                }
                if (item.color) {
                  featureItem
                    .classOn("is-color")
                    .style({ "--color": item.color });
                }
                if (value === item.value || iconSelected) {
                  if (item.property) {
                    if (Array.isArray(item.property))
                      if (
                        item.property
                          .map((i) => tmpMii[i])
                          .every((i) => i === value) === false
                      ) {
                        console.log("FAILED CHECK, skipping");
                        debugger;
                        continue;
                      }
                  }
                  featureItem.classOn("active");
                }
                break;
              case FeatureSetType.Slider:
                if (item.label !== undefined) {
                  new Html("span").text(item.label).appendTo(setList);
                }

                let featureSliderItem = new Html("div")
                  .class("feature-slider")
                  .on("pointerenter", playHoverSound)
                  .appendTo(setList);

                if (item.iconStart) {
                  let frontIcon = new Html("span")
                    .html(item.iconStart)
                    .on("click", () => {
                      // i hate this
                      if (MiiEditor.getCurrentEditor() !== null) {
                        tmpMii = MiiEditor.getCurrentEditor()!.mii;
                      }

                      featureSlider.val(Number(featureSlider.getValue()) - 1);
                      (tmpMii as Record<string, any>)[item.property] = Number(
                        featureSlider.getValue()
                      );
                      if (item.soundStart) playSound(item.soundStart);
                      else playSound("select");
                      update();
                    });
                  featureSliderItem.append(frontIcon);
                }

                let featureSlider = new Html("input")
                  .attr({
                    type: "range",
                    min: item.min,
                    max: item.max
                  })
                  .id(id)
                  .appendTo(featureSliderItem);

                if (item.iconEnd) {
                  let backIcon = new Html("span")
                    .html(item.iconEnd)
                    .on("click", () => {
                      // i hate this
                      if (MiiEditor.getCurrentEditor() !== null) {
                        tmpMii = MiiEditor.getCurrentEditor()!.mii;
                      }

                      featureSlider.val(Number(featureSlider.getValue()) + 1);
                      (tmpMii as Record<string, any>)[item.property] = Number(
                        featureSlider.getValue()
                      );
                      if (item.soundEnd) playSound(item.soundEnd);
                      else playSound("select");
                      update();
                    });
                  featureSliderItem.append(backIcon);
                }

                featureSlider.val(
                  (tmpMii as Record<string, any>)[item.property]
                );

                featureSlider.on("input", () => {
                  // i hate this
                  if (MiiEditor.getCurrentEditor() !== null) {
                    tmpMii = MiiEditor.getCurrentEditor()!.mii;
                  }

                  playSound("slider_tick");
                  (tmpMii as Record<string, any>)[item.property] = Number(
                    featureSlider.getValue()
                  );
                  update();
                });
                break;
              case FeatureSetType.Range:
                let featureRangeGroup = new Html("div")
                  .class("col")
                  .style({ width: "100%", gap: "0", "align-items": "center" })
                  .appendTo(setList);

                if (item.label !== undefined) {
                  new Html("span").text(item.label).appendTo(featureRangeGroup);
                }

                let featureRangeItem = new Html("div")
                  .class("feature-slider")
                  .appendTo(featureRangeGroup);

                if (item.iconStart) {
                  let frontIcon = new Html("span")
                    .html(item.iconStart)
                    .on("click", () => {
                      // i hate this
                      if (MiiEditor.getCurrentEditor() !== null) {
                        tmpMii = MiiEditor.getCurrentEditor()!.mii;
                      }

                      featureRange.val(
                        Number(featureRange.getValue()) +
                          (item.inverse ? 1 : -1)
                      );
                      (tmpMii as Record<string, any>)[item.property] =
                        item.inverse
                          ? item.max +
                            item.min -
                            Number(featureRange.getValue())
                          : Number(featureRange.getValue());
                      if (item.soundStart) playSound(item.soundStart);
                      else playSound("select");
                      update();
                    });
                  if (item.inverse) featureRangeItem.prepend(frontIcon);
                  else featureRangeItem.append(frontIcon);
                }

                let featureRange = new Html("input")
                  .attr({
                    type: "range",
                    min: item.min,
                    max: item.max
                  })
                  .id(id);

                if (item.inverse) featureRangeItem.prepend(featureRange);
                else featureRangeItem.append(featureRange);

                if (item.iconEnd) {
                  let backIcon = new Html("span")
                    .html(item.iconEnd)
                    .on("click", () => {
                      // i hate this
                      if (MiiEditor.getCurrentEditor() !== null) {
                        tmpMii = MiiEditor.getCurrentEditor()!.mii;
                      }

                      featureRange.val(
                        Number(featureRange.getValue()) +
                          (item.inverse ? -1 : 1)
                      );
                      (tmpMii as Record<string, any>)[item.property] =
                        item.inverse
                          ? item.max +
                            item.min -
                            Number(featureRange.getValue())
                          : Number(featureRange.getValue());
                      if (item.soundEnd) playSound(item.soundEnd);
                      else playSound("select");
                      update();
                    });
                  if (item.inverse) featureRangeItem.prepend(backIcon);
                  else featureRangeItem.append(backIcon);
                }

                featureRange.val(
                  item.inverse
                    ? item.max -
                        (tmpMii as Record<string, any>)[item.property] +
                        item.min
                    : (tmpMii as Record<string, any>)[item.property]
                );

                featureRange.on("change", () => {
                  // i hate this
                  if (MiiEditor.getCurrentEditor() !== null) {
                    tmpMii = MiiEditor.getCurrentEditor()!.mii;
                  }

                  const newValue = item.inverse
                    ? item.max + item.min - Number(featureRange.getValue())
                    : Number(featureRange.getValue());
                  const current = (tmpMii as Record<string, any>)[
                    item.property
                  ];

                  if (
                    item.soundStart !== undefined &&
                    item.soundEnd !== undefined
                  ) {
                    if (newValue < current) {
                      playSound(item.soundStart);
                    } else {
                      playSound(item.soundEnd);
                    }
                  }

                  (tmpMii as Record<string, any>)[item.property] = newValue;
                  update();
                });

                featureRange.on("input", () => {
                  playSound("slider_tick");
                });

                break;
              case FeatureSetType.Switch:
                let featureSwitchItem = new Html("div")
                  .class("feature-switch-group")
                  .appendTo(setList);

                let featureSwitch = new Html("div")
                  .class("feature-switch")
                  .id(id)
                  .appendTo(featureSwitchItem);

                let buttonLeft = new Html("button")
                  .class("feature-switch-left")
                  .html(item.iconOff)
                  .appendTo(featureSwitch);
                let buttonRight = new Html("button")
                  .class("feature-switch-right")
                  .html(item.iconOn)
                  .appendTo(featureSwitch);

                const switchToggle = (value: boolean) => {
                  // i hate this
                  if (MiiEditor.getCurrentEditor() !== null) {
                    tmpMii = MiiEditor.getCurrentEditor()!.mii;
                  }

                  let valueToSet: boolean | number = value;
                  if (item.isNumber) {
                    valueToSet = Number(valueToSet);
                  }
                  (tmpMii as Record<string, any>)[item.property] = valueToSet;

                  if (value === false) {
                    if (item.soundOff) playSound(item.soundOff);
                    else playSound("select");
                  }
                  if (value === true) {
                    if (item.soundOn) playSound(item.soundOn);
                    else playSound("select");
                  }
                  update();
                };

                buttonLeft.on("click", () => {
                  switchToggle(false);
                  buttonLeft.classOn("active");
                  buttonRight.classOff("active");
                });
                buttonRight.on("click", () => {
                  switchToggle(true);
                  buttonLeft.classOff("active");
                  buttonRight.classOn("active");
                });
                buttonLeft.on("pointerenter", playHoverSound);
                buttonRight.on("pointerenter", playHoverSound);

                if ((tmpMii as Record<string, any>)[item.property] == true) {
                  buttonLeft.classOff("active");
                  buttonRight.classOn("active");
                } else {
                  buttonLeft.classOn("active");
                  buttonRight.classOff("active");
                }
                break;
              case FeatureSetType.Misc:
                let featureMiscItem = item.html.appendTo(setList);
                featureMiscItem.on("click", item.select);
                break;
            }
          }
        }

        window.LazyLoad.update();
      }
    });
  }

  if (Object.keys(set.entries).length === 1) {
    let tabs = TabList(tabListInit, TabListType.NotSquare);
    tabs.list.appendTo(setContainer);
    tabs.content.appendTo(setContainer);
    // tabListInit[0].select(setContainer);
  } else {
    let tabs = TabList(tabListInit, TabListType.NotSquare);
    tabs.list.appendTo(setContainer);
    tabs.content.appendTo(setContainer);
  }

  return setContainer;
}
