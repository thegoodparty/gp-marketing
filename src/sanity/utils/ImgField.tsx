import {
  defineDocumentFieldAction,
  type DocumentFieldActionItem,
  type ImageValue,
  type ObjectFieldProps, set
} from "sanity";
import {AddIcon} from "@sanity/icons";

export function ImgField(props: ObjectFieldProps<ImageValue>) {
  return props.renderDefault({
    ...props,
    actions: [
      defineDocumentFieldAction({
        name: "prompt",
        useAction: function useAction(): DocumentFieldActionItem {
          return {
            type: "action",
            icon: AddIcon,
            title: `Add prompt`,
            onAction() {
              props.inputProps.onChange(
                set({ ["promptForImage"]: "" }),
              );
            },
            renderAsButton: true,
          };
        },
      }),
      ...(props.actions || []),
    ],
  });
}
