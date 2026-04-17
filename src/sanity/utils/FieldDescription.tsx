import type {ReactNode} from 'react';

export type FieldDescriptionProps = {
  description: ReactNode;
  example?: ReactNode;
};

export function FieldDescription(props: FieldDescriptionProps): string {
  return (
    <>
      {props.description}
      {props.example ? (
        <details>
          <summary
            style={{
              cursor: 'pointer',
              width: 'fit-content',
              lineHeight: 2,
              userSelect: 'none',
            }}
          >
            <strong>Example</strong>
          </summary>
          {props.example}
        </details>
      ) : null}
    </>
  ) as any;
}
