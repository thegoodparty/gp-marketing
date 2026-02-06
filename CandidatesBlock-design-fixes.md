# CandidatesBlock Design Fixes

Design feedback from designer for `src/ui/CandidatesBlock.tsx` and related card components.

## Issues to Address

- [ ] **Issue 1**: "Empowered by goodparty.org" link overlaps with "View profile" link
  - **Location**: `CandidatesCard2.tsx`
  - **Current**: Both links are in the same flex container with `md:items-end` alignment
  - **Fix needed**: Adjust layout to prevent overlap

- [ ] **Issue 2**: Everything should align to the top, with 24px padding
  - **Location**: `CandidatesCard2.tsx` (and possibly `CandidatesCard1.tsx`)
  - **Current**: Uses `p-4` (16px) on mobile, `md:p-6` (24px) on desktop, and `md:items-end` alignment
  - **Fix needed**: Change to 24px padding everywhere, align items to top (`md:items-start`)

- [X] **Issue 3**: Avatar icon should be vertically centered
  - **Location**: `CandidatesCard2.tsx`
  - **Current**: Avatar wrapper doesn't explicitly center vertically
  - **Fix needed**: Ensure avatar is vertically centered relative to card content

- [ ] **Issue 4**: "Empowered by goodparty.org" link should be grey (Neutral 500)
  - **Location**: `CandidatesCard2.tsx` line 17
  - **Current**: Uses `text-goodparty-blue` class
  - **Fix needed**: Change to `text-neutral-500`

- [ ] **Issue 5**: Firstname and Lastname should be across a single line, unless the name is really long
  - **Location**: `CandidatesCard2.tsx` (and possibly `CandidatesCard1.tsx`)
  - **Current**: Name is rendered as-is without wrapping control
  - **Fix needed**: Add conditional wrapping - single line for normal names, allow wrapping for very long names

- [ ] **Issue 6**: Heart + Star logo alignment is slightly off
  - **Location**: `CandidatesCard2.tsx` - Logo badge positioning
  - **Current**: Logo badge uses `absolute bottom-0 right-0` positioning
  - **Fix needed**: Adjust Logo badge alignment to match Figma design

## Notes

- All fixes should be applied to `CandidatesCard2.tsx` (GoodParty candidates)
- Some fixes may also apply to `CandidatesCard1.tsx` (standard candidates)
- Reference Figma design for exact spacing and alignment specifications
