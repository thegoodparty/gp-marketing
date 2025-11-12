import {createElement} from "react";
import {FieldDescription} from "../../utils/FieldDescription.tsx";

export const field_pageSubtitle = {
  name: 'field_pageSubtitle',
  title: 'Page Subtitle',
  description: createElement(FieldDescription,{description:'The subtitle that displays for the page.',example:'Explore campaign guides and resources, all designed with independent, non-partisan, and third-party candidates in mind.'}),
  options: {
    collapsible: false,
    search: {
      weight: 8,
    },
  },
  type: 'text',
}