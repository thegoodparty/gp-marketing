import {IdInput} from './IdInput.tsx';
import {StyledDescription} from './StyledDescription.tsx';
import {IconPicker} from './IconPicker.tsx';
import {LinkSelectType} from './LinkSelect.tsx';

export const customTypes = {
  name: 'customTypes',
  schema: {
    name: 'customTypes',
    types: [
      {
        name: 'StringIcon',
        type: 'string',
        title: 'Icon',
        components: {
          input: IconPicker,
        },
      },
      {
        name: 'StringId',
        type: 'string',
        components: {
          input: IdInput,
        },
        title: 'Id',
      },
      {
        name: 'ObjectAddress',
        type: 'object',
        title: 'Address',
        fields: [
          {
            type: 'array',
            name: 'streetAddress',
            title: 'Address',
            description: (
              <>
                The street address.
                <StyledDescription>
                  <summary>Example</summary>
                  <div>1600 Amphitheatre Pkwy</div>
                </StyledDescription>
              </>
            ),
            initialValue: [''],
            of: [{ type: 'string' }],
          },
          {
            type: 'string',
            name: 'addressLocality',
            title: 'Town / City',
            description: (
              <>
                The locality in which the street address is, and which is in the
                region.
                <StyledDescription>
                  <summary>Example</summary>
                  <div>Mountain View</div>
                </StyledDescription>
              </>
            ),
          },
          {
            type: 'string',
            name: 'addressRegion',
            title: 'County / State',
            description: (
              <>
                The region in which the locality is, and which is in the country.
                <StyledDescription>
                  <summary>Example</summary>
                  <div>
                    California or another appropriate first-level Administrative
                    division
                  </div>
                </StyledDescription>
              </>
            ),
          },
          {
            type: 'string',
            name: 'addressCountry',
            title: 'Country',
            description: (
              <>
                The country. You can also provide the two-letter ISO 3166-1 alpha-2
                country code.
                <StyledDescription>
                  <summary>Example</summary>
                  <div>USA</div>
                </StyledDescription>
              </>
            ),
          },
          {
            type: 'string',
            name: 'postalCode',
            title: 'Postcode / Zip',
            description: (
              <>
                The postal code.
                <StyledDescription>
                  <summary>Example</summary>
                  <div>94043</div>
                </StyledDescription>
              </>
            ),
          },
        ],
      },
      LinkSelectType,
    ],
  },
}
