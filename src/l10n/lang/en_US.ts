import type { Strings } from "../strings";

export default {
  languages: {
    en_US: "English (US)"
  },
  actions: {
    disable: "Disable",
    enable: "Enable",
    edit: "Edit",
    delete: "Delete",
    export_download: "Export/Download",
    render: "Render",
    no: "No",
    yes: "Yes",
    save_and_exit: "Save & Exit",
    exit_without_saving: "Exit without Saving",
    download: "Download"
  },
  generic: {
    app_title: "Mii Creator",
    camera: "Camera",
    useMouseOrTouch: "Use mouse or touch to move the camera.",
    pose: "Pose",
    expression: "Expression",
    render: "Render",
    resolution_width: "Width",
    resolution_height: "Height",
    camera_field_of_view: "Camera FOV"
  },
  alert: {
    audio_requires_action: {
      title: "Audio needs action",
      description:
        "Music will start playing on first click. You can press V to change sound volume (default is 0.35)"
    },
    delete_confirmation: {
      title: "Warning",
      description: "Are you sure you want to delete this Mii?"
    },
    choice: "What would you like to do?"
  },
  pages: {
    mainMenu: {
      title: "Main Menu"
    },
    library: {
      title: "Mii Library",
      options: "Mii Options",
      credits: {
        title: "Credits",
        view: "View Credits",
        // general credits
        datkat21: "Source code by datkat21",
        ariankordi: "Mii Rendering API by ariankordi",
        objecty: "Mii Maker Music by objecty",
        // The localization author name credits are hardcoded into the app and use the language names specified at the top.
        localization: "%lang% by %author%",
        general: "General",
        translators: "Translators"
      },

      export: {
        // this title is reused for export/download and render options
        title: "Mii Export",
        description: "How would you like to save the Mii?",
        // for context, only "save" downloads a file here
        get_ffsd_hex: "Get FFSD (Hex)",
        get_ffsd_b64: "Get FFSD (Base64)",
        save_ffsd_file: "Save FFSD (file)",
        save_miic_file: "Save MiiCreator data (Recommended)",
        get_mii_studio_data: "Get Mii Studio data",
        ffsd_modal: "FFSD code",
        mii_studio_data_modal: "Mii Studio data",
        // begin render choices
        generate_qr: "Generate QR code",
        render_image: "Render an image",
        render_headshot: "Headshot",
        render_full_body: "Full body",
        render_head_only: "Head only",
        // subject to change
        custom_render: "Make your own render"
      },
      custom_render: {
        title: "Prepare Render",
        head: "Head",
        full_body: "Full Body",
        // You don't have to translate these as they are temporary!
        pose_unfinished_warning:
          "This section is a bit unfinished, the poses are custom-made recreations so they are not fully accurate. Pose 3 also has a rotation issue with the head since it has been changed to be pretending to be attached to the body to prevent weird scaling issues. There is also nothing done after pose 4 currently. I'm working on a way to add the Wii U poses directly.",
        render_unfinished_warning:
          "Render resolution options will be here when the feature is ready.",
        idle: "Idle",
        pose: "Pose %n%"
      }
    },
    editor: {
      choice: {
        color: "Color",
        favorite: "Favorite",
        gender: "Gender",
        goatee: "Goatee",
        hat_color: "Hat Color",
        hat: "Hat",
        mustache: "Mustache",
        normal: "Normal",
        position: "Position",
        special: "Special",
        type: "Type"
      },
      quit: {
        title: "Quitting Editor",
        description_no_changes:
          "No changes were made. Are you sure you want to exit?",
        description_changes_made: "Would you like to save?"
      },
      warning_custom: `%custom% is a CUSTOM property, and will not transfer to any other data formats.
It is purely visual and provided for the ability to use in renders.`
    },
    saveData: {
      title: "Save Data",
      import: "Import Save Data",
      export: "Export Save Data"
    },
    settings: {
      title: "Settings",
      // Settings
      settings_bgm: "Background Music",
      settings_sfx: "Sound Effects"
    }
  }
} as Strings;
