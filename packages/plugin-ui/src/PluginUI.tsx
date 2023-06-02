import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark as theme } from "react-syntax-highlighter/dist/esm/styles/prism";
import copy from "copy-to-clipboard";

export type FrameworkTypes = "HTML" | "Tailwind" | "Flutter" | "SwiftUI";

// This must be kept in sync with the backend.
export type PluginSettings = {
  framework: FrameworkTypes;
  jsx: boolean;
  inlineStyle: boolean;
  optimizeLayout: boolean;
  layerName: boolean;
  responsiveRoot: boolean;
  flutterGenerationMode: string;
  swiftUIGenerationMode: string;
};

type PluginUIProps = {
  code: string;
  htmlPreview: {
    size: { width: number; height: number };
    content: string;
  } | null;
  emptySelection: boolean;
  selectedFramework: FrameworkTypes;
  setSelectedFramework: (framework: FrameworkTypes) => void;
  preferences: PluginSettings | null;
  onPreferenceChange: (key: string, value: boolean | string) => void;
};

export const PluginUI = (props: PluginUIProps) => {
  return (
    <div className="flex flex-col h-full dark:text-white">
      <div className="p-2 grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-1">
        {["HTML", "Tailwind", "Flutter", "SwiftUI"].map((tab) => (
          <button
            key={`tab ${tab}`}
            className={`w-full p-1 text-sm ${
              props.selectedFramework === tab
                ? "bg-green-500 dark:bg-green-600 text-white rounded-md font-semibold shadow-sm"
                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border focus:border-0 border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-green-600 dark:hover:bg-green-800 hover:text-white dark:hover:text-white font-semibold shadow-sm"
            }`}
            onClick={() => {
              props.setSelectedFramework(tab as FrameworkTypes);
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.12)",
        }}
      ></div>
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="flex flex-col items-center px-2 py-2 bg-neutral-50 dark:bg-transparent">
          {/* <div className="flex flex-col items-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded">
            <Description selected={props.selectedFramework} />
          </div> */}

          {props.htmlPreview && <Preview htmlPreview={props.htmlPreview} />}
          {/* <ResponsiveGrade /> */}
          {/* <div className="h-2"></div>
        <div className="flex justify-end w-full mb-1">
          <button className="px-4 py-2 text-sm font-semibold text-white bg-neutral-900 rounded-lg ring-1 ring-neutral-700 hover:bg-neutral-700 focus:outline-none">
            Copy
          </button>
        </div> */}
          {/* Code View */}
          <CodePanel
            code={props.code}
            selectedFramework={props.selectedFramework}
            preferences={props.preferences}
            onPreferenceChange={props.onPreferenceChange}
          />

          {/* <ColorsPanel /> */}
          <div className="text-xs">
            Other things go here, such as color, text, etc.
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResponsiveGrade = () => {
  return (
    <div className="flex justify-between w-full">
      <span className="text-sm">80% responsive</span>
      <div className="flex items-center checkbox">
        <input id="uniqueId" type="checkbox" className="w-6 checkbox__box" />
        <label htmlFor="uniqueId" className="text-sm checkbox__label">
          Auto-fix
        </label>
      </div>
    </div>
  );
};

type LocalCodegenPreference =
  // | {
  //     itemType: "alternative-unit";
  //     defaultScaleFactor: number;
  //     scaledUnit: string;
  //     default?: boolean;
  //     includedLanguages?: FrameworkTypes[];
  //   }
  // | {
  //     itemType: "select";
  //     propertyName: Exclude<keyof PluginSettings, "framework">;
  //     label: string;
  //     options: { label: string; value: string; isDefault?: boolean }[];
  //     includedLanguages?: FrameworkTypes[];
  //   }
  // | {
  //     itemType: "action";
  //     propertyName: string;
  //     label: string;
  //     includedLanguages?: FrameworkTypes[];
  //   }
  // |
  {
    itemType: "individual_select";
    propertyName: Exclude<
      keyof PluginSettings,
      "framework" | "flutterGenerationMode" | "swiftUIGenerationMode"
    >;
    label: string;
    value?: boolean;
    isDefault?: boolean;
    includedLanguages?: FrameworkTypes[];
  };

export const preferenceOptions: LocalCodegenPreference[] = [
  {
    itemType: "individual_select",
    propertyName: "jsx",
    label: "React (JSX)",
    isDefault: false,
    includedLanguages: ["HTML", "Tailwind"],
  },
  // {
  //   itemType: "individual_select",
  //   propertyName: "inlineStyle",
  //   label: "Inline Style",
  //   isDefault: true,
  //   includedLanguages: ["HTML"],
  // },
  // {
  //   itemType: "individual_select",
  //   propertyName: "responsiveRoot",
  //   label: "Responsive Root",
  //   isDefault: false,
  //   includedLanguages: ["Tailwind"],
  // },
  {
    itemType: "individual_select",
    propertyName: "optimizeLayout",
    label: "Optimize Layout",
    isDefault: true,
    includedLanguages: ["HTML", "Tailwind", "Flutter", "SwiftUI"],
  },
  {
    itemType: "individual_select",
    propertyName: "layerName",
    label: "Layer Names",
    isDefault: false,
    includedLanguages: ["HTML", "Tailwind", "SwiftUI"],
  },
  // Add your preferences data here
];

const selectPreferenceOptions: {
  itemType: "select";
  propertyName: Exclude<keyof PluginSettings, "framework">;
  label: string;
  options: { label: string; value: string; isDefault?: boolean }[];
  includedLanguages?: FrameworkTypes[];
}[] = [
  {
    itemType: "select",
    propertyName: "flutterGenerationMode",
    label: "Mode",
    options: [
      { label: "Full App", value: "fullApp" },
      { label: "Stateless", value: "stateless" },
      { label: "Snippet", value: "snippet" },
    ],
    includedLanguages: ["Flutter"],
  },
  {
    itemType: "select",
    propertyName: "swiftUIGenerationMode",
    label: "Mode",
    options: [
      { label: "Struct", value: "struct" },
      { label: "Snippet", value: "snippet" },
    ],
    includedLanguages: ["SwiftUI"],
  },
];

export const CodePanel = (props: {
  code: string;
  selectedFramework: FrameworkTypes;
  preferences: PluginSettings | null;
  onPreferenceChange: (key: string, value: boolean | string) => void;
}) => {
  const emptySelection = false;
  const [isPressed, setIsPressed] = useState(false);
  const [syntaxHovered, setSyntaxHovered] = useState(false);

  // Add your clipboard function here or any other actions
  const handleButtonClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 250);
    copy(props.code);
  };

  const handleButtonHover = () => setSyntaxHovered(true);
  const handleButtonLeave = () => setSyntaxHovered(false);

  if (emptySelection) {
    return (
      <div className="flex flex-col space-y-2 m-auto items-center justify-center p-4 {sectionStyle}">
        <p className="text-lg font-bold">Nothing is selected</p>
        <p className="text-xs">Try selecting a layer, any layer</p>
      </div>
    );
  } else {
    const selectablePreferencesFiltered = selectPreferenceOptions.filter(
      (preference) =>
        preference.includedLanguages?.includes(props.selectedFramework)
    );

    return (
      <div className="w-full">
        <div className="flex items-center justify-between space-x-2">
          <p className="py-1.5 text-lg font-medium text-center dark:text-white rounded-lg">
            Code
          </p>
          <button
            className={`px-4 py-1 text-sm font-semibold border border-green-500 rounded-md shadow-sm hover:bg-green-500 dark:hover:bg-green-600 hover:text-white hover:border-transparent transition-all duration-300 ${
              isPressed
                ? "bg-green-500 dark:text-white hover:bg-green-500 ring-4 ring-green-300 ring-opacity-50 animate-pulse"
                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600"
            }`}
            onClick={handleButtonClick}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            Copy
          </button>
        </div>

        <div className="flex gap-2 justify-center flex-col p-2 bg-black bg-opacity-25 rounded-lg text-sm">
          <div className="flex gap-2 items-center flex-wrap">
            {/* <span className="min-w-[60px] font-medium">Settings</span> */}

            {preferenceOptions
              .filter((preference) =>
                preference.includedLanguages?.includes(props.selectedFramework)
              )
              .map((preference) => (
                <SelectableToggle
                  key={preference.propertyName}
                  title={preference.label}
                  isSelected={
                    props.preferences?.[preference.propertyName] ??
                    preference.isDefault
                  }
                  onSelect={(value) => {
                    props.onPreferenceChange(preference.propertyName, value);
                  }}
                  buttonClass="bg-black dark:ring-green-800"
                  checkClass="bg-black dark:bg-green-500 dark:border-green-500 ring-green-300"
                />
              ))}
          </div>
          {selectablePreferencesFiltered.length > 0 && (
            <>
              <div className="w-full h-px bg-white bg-opacity-25" />

              <div className="flex gap-2 items-center flex-wrap">
                {selectablePreferencesFiltered.map((preference) => (
                  <>
                    {/* <span className="min-w-[60px] font-medium">
                      {preference.label}
                    </span> */}
                    {preference.options.map((option) => (
                      <SelectableToggle
                        key={option.label}
                        title={option.label}
                        isSelected={
                          option.value ===
                            props.preferences?.[preference.propertyName] ??
                          option.isDefault
                        }
                        onSelect={() => {
                          props.onPreferenceChange(
                            preference.propertyName,
                            option.value
                          );
                        }}
                        buttonClass="bg-black dark:ring-blue-800"
                        checkClass="bg-black dark:bg-blue-500 dark:border-blue-500 ring-blue-300"
                      />
                    ))}
                  </>
                ))}
              </div>
            </>
          )}
        </div>

        {/* <div className="h-2" />

        <div className="flex gap-2 items-center p-2 flex-wrap bg-black bg-opacity-25 rounded-lg text-sm"></div> */}

        <div
          className={`rounded-lg ring-green-600 transition-all duratio overflow-clip ${
            syntaxHovered ? "ring-2" : "ring-0"
          }`}
        >
          <SyntaxHighlighter
            language="dart"
            style={theme}
            customStyle={{
              fontSize: 12,
              borderRadius: 8,
              backgroundColor: syntaxHovered ? "#1E2B1A" : "#1B1B1B",
              transitionProperty: "all",
              transitionTimingFunction: "ease",
              transitionDuration: "0.2s",
            }}
          >
            {props.code}
          </SyntaxHighlighter>
        </div>

        <div className="flex items-center content-center justify-end mx-2 mb-2 space-x-8">
          {/* <Switch id="material" text="Material" /> */}
        </div>
      </div>
    );
  }
};

export const ColorsPanel = (props: {
  // colors: string;
  // onColorClick: (color: string) => void;
}) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <div className="flex flex-wrap items-start space-x-2 lg:space-x-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-gray-800 dark:text-gray-200 mb-2">Text</h2>
            {["Button1", "Button2", "Button3"].map((button, idx) => (
              <button
                key={idx}
                className="bg-white dark:bg-gray-800 p-2 mb-1 rounded-lg focus:outline-none focus:ring-0 hover:bg-gray-200 dark:hover:bg-gray-700 w-full transition"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Tt
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {button}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex-1 lg:max-w-[200px]">
            <h2 className="text-gray-800 dark:text-gray-200 mb-2">Colors</h2>
            <div className="flex flex-wrap">
              {["red-500", "yellow-500", "blue-500"].map((color, idx) => (
                <button
                  key={idx}
                  className={`bg-${color} w-full sm:w-1/2 lg:w-full h-16 mb-1 rounded-lg focus:outline-none focus:ring-0 transition`}
                >
                  <div className="flex flex-col h-full justify-center items-center">
                    <span className="text-xs font-semibold text-white">
                      Color{idx + 1}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type SelectableToggleProps = {
  onSelect: (isSelected: boolean) => void;
  isSelected?: boolean;
  title: string;
  buttonClass: string;
  checkClass: string;
};

const SelectableToggle = ({
  onSelect,
  isSelected = false,
  title,
  buttonClass,
  checkClass,
}: SelectableToggleProps) => {
  const handleClick = () => {
    onSelect(!isSelected);
  };

  return (
    <button
      onClick={handleClick}
      className={`h-8 px-2 truncate flex items-center justify-center rounded-md cursor-pointer transition-all duration-300
      hover:bg-neutral-200 dark:hover:bg-neutral-700 gap-2 text-sm ring-1 
      ${
        isSelected
          ? buttonClass
          : "bg-neutral-100 dark:bg-neutral-800 dark:ring-neutral-700 ring-neutral-300"
      }`}
    >
      <span
        className={`h-3 w-3 flex-shrink-0 border-neutral-500 border-2 ${
          isSelected ? checkClass : "bg-transparent dark:border-neutral-500"
        }`}
        style={{
          borderRadius: 4,
        }}
      ></span>
      {title}
    </button>
  );
};

export const Preview: React.FC<{
  htmlPreview: {
    size: { width: number; height: number };
    content: string;
  };
}> = (props) => {
  const previewWidths = [45, 80, 140];
  const labels = ["sm", "md", "lg"];

  return (
    <div className="flex flex-col">
      <p className="px-4 py-1.5 text-lg font-medium text-center dark:text-white rounded-lg">
        Responsive Preview
      </p>
      <div className="flex gap-2 justify-center items-center">
        {previewWidths.map((targetWidth, index) => {
          const targetHeight = 80;
          const scaleFactor = Math.min(
            targetWidth / props.htmlPreview.size.width,
            targetHeight / props.htmlPreview.size.height
          );
          return (
            <div
              key={"preview " + index}
              className="relative flex flex-col items-center"
              style={{ width: targetWidth }}
            >
              <div
                className="flex flex-col justify-center items-center border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm"
                style={{
                  width: targetWidth,
                  height: targetHeight,
                  clipPath: "inset(0px round 6px)",
                }}
              >
                <div
                  style={{
                    zoom: scaleFactor,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: props.htmlPreview.content,
                  }}
                />
              </div>
              <span className="mt-auto text-xs text-gray-500">
                {labels[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const viewDocumentationWebsite = () => {
  return (
    <div className="p-4 bg-neutral-100 dark:bg-neutral-700 rounded-md shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
        Documentation
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
        Learn how to use our Figma plugin and explore its features in detail by
        visiting our documentation website.
      </p>
      <a
        href="https://documentation.example.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-500 transition-colors duration-300"
      >
        Visit Documentation Website &rarr;
      </a>
    </div>
  );
};
