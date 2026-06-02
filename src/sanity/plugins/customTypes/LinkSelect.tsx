import {sites} from '../../../../sites.ts';
import {documentSchema} from '../../schema/documents/documentSchema.ts';
import {
  ChangeIndicator,
  PatchEvent,
  type ReferenceDefinition,
  set,
  type StringInputProps
} from 'sanity';
import {useEffect} from 'react';
import {useDocumentPane} from 'sanity/structure';
import {Autocomplete, Card, Text} from '@sanity/ui';
import {styled} from 'styled-components';


const sitesList = Object.entries(sites)

export const Tighten = styled.div`
  & > [data-ui='Stack'] > [data-ui='Box'] > [data-ui='Grid'] > div > [data-ui='Stack'] {
    gap: 12px;

    & > [data-ui='Stack']:first-of-type {
      & > [data-ui='Stack'] {
        justify-self: flex-start;
        --card-border-color: #000;

        & [data-ui='TextInput'] [data-ui='Card']:first-of-type {
          border: none;
          background-color: var(--card-bg2-color);
        }
      }
    }
  }
`;
export const LinkSelectType = {
  name: 'LinkSelect',
  type: 'object',
  title: 'Link Select',
  options: {
    collapsible: false,
  },
  components: {
    field: props => <Tighten>{props.renderDefault(props)}</Tighten>,
  },
  fields: [
    {
      name: 'site',
      title: `Select a site`,
      type: 'string',
      options: {
        list: sitesList.length ? sitesList.map(([value,data]) => ({value, title: data.title})) : undefined,
      },
      components: {
        field: SimpleFieldField,
        input: LinkSiteInput,
      },
    },
    ...sitesList.map(([siteId]) => {
      return {
        type: 'reference',
        to: documentSchema.flatMap(doc => {
          const isInChannel = doc.options.channels && siteId in doc.options.channels
          if(!isInChannel) {
            return []
          }
          return {type: doc.name}
        }),
        name: 'href',
        title: `Link`,
        hidden: (x) => !String(x.parent?.site),
        components: {
          field: SimpleFieldField,
        },
      } satisfies ReferenceDefinition
    })
  ]
}

function SimpleFieldField(props) {
  return props.renderDefault({
    ...props,
    level: 0,
    title: undefined,
    actions: [],
    __internal_comments: undefined,
  })
}

export const PreCon = styled.div`
  width: 32px;
  height: 32px;
  margin-right: 1px;
  & svg {
    width: 32px;
    height: 32px;
    opacity: 0.65;
  }
`;
export const RowCon = styled.div`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  & svg {
    width: 15px;
    height: 15px;
  }
`;

function LinkSiteInput(props: StringInputProps) {
  const items = (props.schemaType.options?.list || []) as {value: string; title: string}[]
  const { onChange } = useDocumentPane();
  const [_,currentSiteData] = sitesList.find(([siteId]) => siteId === props.value) || [undefined,undefined];
  useEffect(() => {
    if (!props.value && items.at(0)?.value) {
      onChange(
        PatchEvent.from(
          set(
            { ['site']: items.at(0)!.value },
            props.path.slice(0, -1),
          ),
        ),
      );
    }
  }, [props.value]);
  return (
    <ChangeIndicator
      path={props.path}
      isChanged={false}
      hasFocus={!!props.focused}
      style={{ maxWidth: 'fit-content' }}
    >
      <Autocomplete
        {...props.elementProps}
        openButton
        readOnly={props.readOnly}
        customValidity={props.validationError}
        value={currentSiteData?.title}
        radius={0}
        prefix={
          <PreCon>{currentSiteData?.icon()}</PreCon>
        }
        style={{ maxWidth: 'fit-content' }}
        fontSize={[1]}
        onChange={(nextItem) => {
          if (nextItem !== props.value) {
            onChange(
              PatchEvent.from(
                set({ ['site']: nextItem }, props.path.slice(0, -1)),
              ),
            );
          }
        }}
        options={items.map((item) => ({
          value: String(item.value),
          payload: item,
        }))}
        placeholder="Search options"
        renderValue={(value, option) => option?.payload.title || value}
        renderOption={(option) => {
          const [_,rowData] = sitesList.find(([siteId]) => siteId === option.value) || [undefined,undefined]
          return (
            <Card
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              as="button"
              padding={2}
            >
              <RowCon>{rowData?.icon()}</RowCon>
              <Text size={1}>{option.payload.title}</Text>
            </Card>
          );
        }}
        // filterOption={(query, option) => {
        //   if (
        //     query ===
        //     sitesList.find(([siteId,{title,url}]) => [siteId,title,url].includes(props.value))?.name
        //   ) {
        //     return true;
        //   }
        //   return (
        //     option?.payload.title
        //       .toLowerCase()
        //       .indexOf(query.toLowerCase()) > -1
        //   );
        // }}
      />
    </ChangeIndicator>
  );
}
