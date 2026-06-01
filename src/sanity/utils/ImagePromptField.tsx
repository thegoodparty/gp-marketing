import {
  defineDocumentFieldAction,
  type DocumentFieldActionItem,
  type StringFieldProps, unset
} from 'sanity';
import {RemoveIcon} from '@sanity/icons';

export function ImagePromptField(props: StringFieldProps) {
  return props.renderDefault({
    ...props,
    actions: [
      defineDocumentFieldAction({
        name: 'prompt',
        useAction: function useAction(): DocumentFieldActionItem {
          return {
            type: 'action',
            icon: RemoveIcon,
            title: `Remove prompt`,
            onAction() {
              props.inputProps.onChange(unset());
            },
            renderAsButton: true,
          };
        },
      }),
      ...(props.actions || []),
    ],
  });
}
