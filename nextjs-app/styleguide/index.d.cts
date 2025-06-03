export { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronUpDownIcon as ChevronsUpDownIcon, ArrowDownTrayIcon as DownloadIcon, EyeIcon, DocumentIcon as FileIcon, FolderOpenIcon, Bars3Icon as GripVerticalIcon, QuestionMarkCircleIcon as HelpCircleIcon, HomeIcon, ArrowRightOnRectangleIcon as LogOutIcon, MinusIcon, EllipsisHorizontalIcon as MoreHorizontalIcon, Bars3BottomLeftIcon as PanelLeftIcon, PencilIcon, MagnifyingGlassIcon as SearchIcon, CogIcon as SettingsIcon, StarIcon, UserIcon, UsersIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React$1 from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { Command as Command$1 } from 'cmdk';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { Drawer as Drawer$1 } from 'vaul';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as react_hook_form from 'react-hook-form';
import { FieldValues, FieldPath, ControllerProps } from 'react-hook-form';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { OTPInput } from 'input-otp';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as ResizablePrimitive from 'react-resizable-panels';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { ToasterProps } from 'sonner';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

declare function Accordion({ ...props }: React$1.ComponentProps<typeof AccordionPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function AccordionItem({ className, ...props }: React$1.ComponentProps<typeof AccordionPrimitive.Item>): react_jsx_runtime.JSX.Element;
declare function AccordionTrigger({ className, children, ...props }: React$1.ComponentProps<typeof AccordionPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function AccordionContent({ className, children, ...props }: React$1.ComponentProps<typeof AccordionPrimitive.Content>): react_jsx_runtime.JSX.Element;

declare const alertVariants: (props?: ({
    variant?: "default" | "destructive" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Alert({ className, variant, ...props }: React$1.ComponentProps<"div"> & VariantProps<typeof alertVariants>): react_jsx_runtime.JSX.Element;
declare function AlertTitle({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function AlertDescription({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;

declare function AlertDialog({ ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function AlertDialogTrigger({ ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function AlertDialogPortal({ ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Portal>): react_jsx_runtime.JSX.Element;
declare function AlertDialogOverlay({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Overlay>): react_jsx_runtime.JSX.Element;
declare function AlertDialogContent({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function AlertDialogHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function AlertDialogFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function AlertDialogTitle({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Title>): react_jsx_runtime.JSX.Element;
declare function AlertDialogDescription({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Description>): react_jsx_runtime.JSX.Element;
declare function AlertDialogAction({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Action>): react_jsx_runtime.JSX.Element;
declare function AlertDialogCancel({ className, ...props }: React$1.ComponentProps<typeof AlertDialogPrimitive.Cancel>): react_jsx_runtime.JSX.Element;

declare function AspectRatio({ ...props }: React.ComponentProps<typeof AspectRatioPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare const avatarVariants: (props?: ({
    size?: "small" | "xSmall" | "medium" | "large" | "xLarge" | null | undefined;
    variant?: "default" | "brightyellow" | "lavender" | "halogreen" | "blue" | "waxflower" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const avatarBadgeVariants: (props?: ({
    size?: "small" | "medium" | "large" | null | undefined;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AvatarProps extends React$1.ComponentProps<typeof AvatarPrimitive.Root>, VariantProps<typeof avatarVariants> {
}
interface AvatarBadgeProps extends React$1.ComponentProps<"div">, VariantProps<typeof avatarBadgeVariants> {
}
declare function Avatar({ className, size, variant, ...props }: AvatarProps): react_jsx_runtime.JSX.Element;
declare namespace Avatar {
    var Image: typeof AvatarImage;
    var Fallback: typeof AvatarFallback;
    var Icon: typeof AvatarIcon;
    var Badge: typeof AvatarBadge;
}
declare function AvatarImage({ className, ...props }: React$1.ComponentProps<typeof AvatarPrimitive.Image>): react_jsx_runtime.JSX.Element;
declare function AvatarFallback({ className, ...props }: React$1.ComponentProps<typeof AvatarPrimitive.Fallback>): react_jsx_runtime.JSX.Element;
declare function AvatarIcon({ className, children, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function AvatarBadge({ className, size, position, ...props }: AvatarBadgeProps): react_jsx_runtime.JSX.Element;

declare const badgeVariants: (props?: ({
    variant?: "default" | "destructive" | "secondary" | "outline" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Badge({ className, variant, asChild, ...props }: React$1.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function Breadcrumb({ ...props }: React$1.ComponentProps<"nav">): react_jsx_runtime.JSX.Element;
declare function BreadcrumbList({ className, ...props }: React$1.ComponentProps<"ol">): react_jsx_runtime.JSX.Element;
declare function BreadcrumbItem({ className, ...props }: React$1.ComponentProps<"li">): react_jsx_runtime.JSX.Element;
declare function BreadcrumbLink({ asChild, className, ...props }: React$1.ComponentProps<"a"> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function BreadcrumbPage({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;
declare function BreadcrumbSeparator({ children, className, ...props }: React$1.ComponentProps<"li">): react_jsx_runtime.JSX.Element;
declare function BreadcrumbEllipsis({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;

declare const buttonVariants: (props?: ({
    variant?: "default" | "destructive" | "secondary" | "outline" | "ghost" | "whiteOutline" | "whiteGhost" | null | undefined;
    size?: "small" | "xSmall" | "medium" | "large" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Button({ className, variant, size, asChild, ...props }: React$1.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function Card({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardTitle({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardDescription({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardAction({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardContent({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];
type CarouselProps = {
    opts?: CarouselOptions;
    plugins?: CarouselPlugin;
    orientation?: "horizontal" | "vertical";
    setApi?: (api: CarouselApi) => void;
};
declare function Carousel({ orientation, opts, setApi, plugins, className, children, ...props }: React$1.ComponentProps<"div"> & CarouselProps): react_jsx_runtime.JSX.Element;
declare function CarouselContent({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CarouselItem({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CarouselPrevious({ className, variant, size, ...props }: React$1.ComponentProps<typeof Button>): react_jsx_runtime.JSX.Element;
declare function CarouselNext({ className, variant, size, ...props }: React$1.ComponentProps<typeof Button>): react_jsx_runtime.JSX.Element;

declare function Checkbox({ className, ...props }: React$1.ComponentProps<typeof CheckboxPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function CollapsibleTrigger({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>): react_jsx_runtime.JSX.Element;
declare function CollapsibleContent({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>): react_jsx_runtime.JSX.Element;

declare function Dialog({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function DialogTrigger({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function DialogPortal({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Portal>): react_jsx_runtime.JSX.Element;
declare function DialogClose({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Close>): react_jsx_runtime.JSX.Element;
declare function DialogOverlay({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Overlay>): react_jsx_runtime.JSX.Element;
declare function DialogContent({ className, children, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function DialogHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function DialogFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function DialogTitle({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Title>): react_jsx_runtime.JSX.Element;
declare function DialogDescription({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Description>): react_jsx_runtime.JSX.Element;

declare function Command({ className, ...props }: React$1.ComponentProps<typeof Command$1>): react_jsx_runtime.JSX.Element;
declare function CommandDialog({ title, description, children, ...props }: React$1.ComponentProps<typeof Dialog> & {
    title?: string;
    description?: string;
}): react_jsx_runtime.JSX.Element;
declare function CommandInput({ className, ...props }: React$1.ComponentProps<typeof Command$1.Input>): react_jsx_runtime.JSX.Element;
declare function CommandList({ className, ...props }: React$1.ComponentProps<typeof Command$1.List>): react_jsx_runtime.JSX.Element;
declare function CommandEmpty({ ...props }: React$1.ComponentProps<typeof Command$1.Empty>): react_jsx_runtime.JSX.Element;
declare function CommandGroup({ className, ...props }: React$1.ComponentProps<typeof Command$1.Group>): react_jsx_runtime.JSX.Element;
declare function CommandSeparator({ className, ...props }: React$1.ComponentProps<typeof Command$1.Separator>): react_jsx_runtime.JSX.Element;
declare function CommandItem({ className, ...props }: React$1.ComponentProps<typeof Command$1.Item>): react_jsx_runtime.JSX.Element;
declare function CommandShortcut({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;

declare function ContextMenu({ ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function ContextMenuTrigger({ ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function ContextMenuGroup({ ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.Group>): react_jsx_runtime.JSX.Element;
declare function ContextMenuPortal({ ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.Portal>): react_jsx_runtime.JSX.Element;
declare function ContextMenuSub({ ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.Sub>): react_jsx_runtime.JSX.Element;
declare function ContextMenuRadioGroup({ ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>): react_jsx_runtime.JSX.Element;
declare function ContextMenuSubTrigger({ className, inset, children, ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function ContextMenuSubContent({ className, ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.SubContent>): react_jsx_runtime.JSX.Element;
declare function ContextMenuContent({ className, ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function ContextMenuItem({ className, inset, variant, ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
}): react_jsx_runtime.JSX.Element;
declare function ContextMenuCheckboxItem({ className, children, checked, ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>): react_jsx_runtime.JSX.Element;
declare function ContextMenuRadioItem({ className, children, ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.RadioItem>): react_jsx_runtime.JSX.Element;
declare function ContextMenuLabel({ className, inset, ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function ContextMenuSeparator({ className, ...props }: React$1.ComponentProps<typeof ContextMenuPrimitive.Separator>): react_jsx_runtime.JSX.Element;
declare function ContextMenuShortcut({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;

declare function Drawer({ ...props }: React$1.ComponentProps<typeof Drawer$1.Root>): react_jsx_runtime.JSX.Element;
declare function DrawerTrigger({ ...props }: React$1.ComponentProps<typeof Drawer$1.Trigger>): react_jsx_runtime.JSX.Element;
declare function DrawerPortal({ ...props }: React$1.ComponentProps<typeof Drawer$1.Portal>): react_jsx_runtime.JSX.Element;
declare function DrawerClose({ ...props }: React$1.ComponentProps<typeof Drawer$1.Close>): react_jsx_runtime.JSX.Element;
declare function DrawerOverlay({ className, ...props }: React$1.ComponentProps<typeof Drawer$1.Overlay>): react_jsx_runtime.JSX.Element;
declare function DrawerContent({ className, children, ...props }: React$1.ComponentProps<typeof Drawer$1.Content>): react_jsx_runtime.JSX.Element;
declare function DrawerHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function DrawerFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function DrawerTitle({ className, ...props }: React$1.ComponentProps<typeof Drawer$1.Title>): react_jsx_runtime.JSX.Element;
declare function DrawerDescription({ className, ...props }: React$1.ComponentProps<typeof Drawer$1.Description>): react_jsx_runtime.JSX.Element;

declare function DropdownMenu({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuPortal({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Portal>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuTrigger({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuContent({ className, sideOffset, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuGroup({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Group>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuItem({ className, inset, variant, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
}): react_jsx_runtime.JSX.Element;
declare function DropdownMenuCheckboxItem({ className, children, checked, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuRadioGroup({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuRadioItem({ className, children, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuLabel({ className, inset, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function DropdownMenuSeparator({ className, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Separator>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuShortcut({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;
declare function DropdownMenuSub({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Sub>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuSubTrigger({ className, inset, children, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function DropdownMenuSubContent({ className, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.SubContent>): react_jsx_runtime.JSX.Element;

declare const Form: <TFieldValues extends FieldValues, TContext = any, TTransformedValues = TFieldValues>(props: react_hook_form.FormProviderProps<TFieldValues, TContext, TTransformedValues>) => React$1.JSX.Element;
declare const FormField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => react_jsx_runtime.JSX.Element;
declare const useFormField: () => {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    isValidating: boolean;
    error?: react_hook_form.FieldError;
    id: string;
    name: string;
    formItemId: string;
    formDescriptionId: string;
    formMessageId: string;
};
declare function FormItem({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function FormLabel({ className, ...props }: React$1.ComponentProps<typeof LabelPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function FormControl({ ...props }: React$1.ComponentProps<typeof Slot>): react_jsx_runtime.JSX.Element;
declare function FormDescription({ className, ...props }: React$1.ComponentProps<"p">): react_jsx_runtime.JSX.Element;
declare function FormMessage({ className, ...props }: React$1.ComponentProps<"p">): react_jsx_runtime.JSX.Element | null;

declare function HoverCard({ ...props }: React$1.ComponentProps<typeof HoverCardPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function HoverCardTrigger({ ...props }: React$1.ComponentProps<typeof HoverCardPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function HoverCardContent({ className, align, sideOffset, ...props }: React$1.ComponentProps<typeof HoverCardPrimitive.Content>): react_jsx_runtime.JSX.Element;

declare const iconButtonVariants: (props?: ({
    variant?: "default" | "destructive" | "secondary" | "outline" | "ghost" | "whiteOutline" | "whiteGhost" | null | undefined;
    size?: "small" | "xSmall" | "medium" | "large" | "xLarge" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface IconButtonProps extends React$1.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
    asChild?: boolean;
}
declare function IconButton({ className, variant, size, asChild, ...props }: IconButtonProps): react_jsx_runtime.JSX.Element;

declare function Input({ className, type, ...props }: React$1.ComponentProps<"input">): react_jsx_runtime.JSX.Element;

declare function InputOTP({ className, containerClassName, ...props }: React$1.ComponentProps<typeof OTPInput> & {
    containerClassName?: string;
}): react_jsx_runtime.JSX.Element;
declare function InputOTPGroup({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function InputOTPSlot({ index, className, ...props }: React$1.ComponentProps<"div"> & {
    index: number;
}): react_jsx_runtime.JSX.Element;
declare function InputOTPSeparator({ ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;

declare function Label({ className, ...props }: React$1.ComponentProps<typeof LabelPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare function Menubar({ className, ...props }: React$1.ComponentProps<typeof MenubarPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function MenubarMenu({ ...props }: React$1.ComponentProps<typeof MenubarPrimitive.Menu>): react_jsx_runtime.JSX.Element;
declare function MenubarGroup({ ...props }: React$1.ComponentProps<typeof MenubarPrimitive.Group>): react_jsx_runtime.JSX.Element;
declare function MenubarPortal({ ...props }: React$1.ComponentProps<typeof MenubarPrimitive.Portal>): react_jsx_runtime.JSX.Element;
declare function MenubarRadioGroup({ ...props }: React$1.ComponentProps<typeof MenubarPrimitive.RadioGroup>): react_jsx_runtime.JSX.Element;
declare function MenubarTrigger({ className, ...props }: React$1.ComponentProps<typeof MenubarPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function MenubarContent({ className, align, alignOffset, sideOffset, ...props }: React$1.ComponentProps<typeof MenubarPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function MenubarItem({ className, inset, variant, ...props }: React$1.ComponentProps<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
}): react_jsx_runtime.JSX.Element;
declare function MenubarCheckboxItem({ className, children, checked, ...props }: React$1.ComponentProps<typeof MenubarPrimitive.CheckboxItem>): react_jsx_runtime.JSX.Element;
declare function MenubarRadioItem({ className, children, ...props }: React$1.ComponentProps<typeof MenubarPrimitive.RadioItem>): react_jsx_runtime.JSX.Element;
declare function MenubarLabel({ className, inset, ...props }: React$1.ComponentProps<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function MenubarSeparator({ className, ...props }: React$1.ComponentProps<typeof MenubarPrimitive.Separator>): react_jsx_runtime.JSX.Element;
declare function MenubarShortcut({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;
declare function MenubarSub({ ...props }: React$1.ComponentProps<typeof MenubarPrimitive.Sub>): react_jsx_runtime.JSX.Element;
declare function MenubarSubTrigger({ className, inset, children, ...props }: React$1.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function MenubarSubContent({ className, ...props }: React$1.ComponentProps<typeof MenubarPrimitive.SubContent>): react_jsx_runtime.JSX.Element;

declare function NavigationMenu({ className, children, viewport, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
    viewport?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function NavigationMenuList({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.List>): react_jsx_runtime.JSX.Element;
declare function NavigationMenuItem({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Item>): react_jsx_runtime.JSX.Element;
declare const navigationMenuTriggerStyle: (props?: class_variance_authority_types.ClassProp | undefined) => string;
declare function NavigationMenuTrigger({ className, children, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function NavigationMenuContent({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function NavigationMenuViewport({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Viewport>): react_jsx_runtime.JSX.Element;
declare function NavigationMenuLink({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Link>): react_jsx_runtime.JSX.Element;
declare function NavigationMenuIndicator({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Indicator>): react_jsx_runtime.JSX.Element;

declare function Pagination({ className, ...props }: React$1.ComponentProps<"nav">): react_jsx_runtime.JSX.Element;
declare function PaginationContent({ className, ...props }: React$1.ComponentProps<"ul">): react_jsx_runtime.JSX.Element;
declare function PaginationItem({ ...props }: React$1.ComponentProps<"li">): react_jsx_runtime.JSX.Element;
type PaginationLinkProps = {
    isActive?: boolean;
} & Pick<React$1.ComponentProps<typeof Button>, "size"> & React$1.ComponentProps<"a">;
declare function PaginationLink({ className, isActive, size, ...props }: PaginationLinkProps): react_jsx_runtime.JSX.Element;
declare function PaginationPrevious({ className, ...props }: React$1.ComponentProps<typeof PaginationLink>): react_jsx_runtime.JSX.Element;
declare function PaginationNext({ className, ...props }: React$1.ComponentProps<typeof PaginationLink>): react_jsx_runtime.JSX.Element;
declare function PaginationEllipsis({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;

declare function Popover({ ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function PopoverTrigger({ ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function PopoverContent({ className, align, sideOffset, ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function PopoverAnchor({ ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Anchor>): react_jsx_runtime.JSX.Element;

declare function Progress({ className, value, ...props }: React$1.ComponentProps<typeof ProgressPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare function RadioGroup({ className, ...props }: React$1.ComponentProps<typeof RadioGroupPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function RadioGroupItem({ className, ...props }: React$1.ComponentProps<typeof RadioGroupPrimitive.Item>): react_jsx_runtime.JSX.Element;

declare function ResizablePanelGroup({ className, ...props }: React$1.ComponentProps<typeof ResizablePrimitive.PanelGroup>): react_jsx_runtime.JSX.Element;
declare function ResizablePanel({ ...props }: React$1.ComponentProps<typeof ResizablePrimitive.Panel>): react_jsx_runtime.JSX.Element;
declare function ResizableHandle({ withHandle, className, ...props }: React$1.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
    withHandle?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function ScrollArea({ className, children, ...props }: React$1.ComponentProps<typeof ScrollAreaPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function ScrollBar({ className, orientation, ...props }: React$1.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>): react_jsx_runtime.JSX.Element;

declare function Select({ ...props }: React$1.ComponentProps<typeof SelectPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function SelectGroup({ ...props }: React$1.ComponentProps<typeof SelectPrimitive.Group>): react_jsx_runtime.JSX.Element;
declare function SelectValue({ ...props }: React$1.ComponentProps<typeof SelectPrimitive.Value>): react_jsx_runtime.JSX.Element;
declare function SelectTrigger({ className, size, children, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Trigger> & {
    size?: "sm" | "default";
}): react_jsx_runtime.JSX.Element;
declare function SelectContent({ className, children, position, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function SelectLabel({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Label>): react_jsx_runtime.JSX.Element;
declare function SelectItem({ className, children, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Item>): react_jsx_runtime.JSX.Element;
declare function SelectSeparator({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Separator>): react_jsx_runtime.JSX.Element;
declare function SelectScrollUpButton({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.ScrollUpButton>): react_jsx_runtime.JSX.Element;
declare function SelectScrollDownButton({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.ScrollDownButton>): react_jsx_runtime.JSX.Element;

declare function Separator({ className, orientation, decorative, ...props }: React$1.ComponentProps<typeof SeparatorPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare function Sheet({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function SheetTrigger({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function SheetClose({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Close>): react_jsx_runtime.JSX.Element;
declare function SheetContent({ className, children, side, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Content> & {
    side?: "top" | "right" | "bottom" | "left";
}): react_jsx_runtime.JSX.Element;
declare function SheetHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SheetFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SheetTitle({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Title>): react_jsx_runtime.JSX.Element;
declare function SheetDescription({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Description>): react_jsx_runtime.JSX.Element;

declare function TooltipProvider({ delayDuration, ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Provider>): react_jsx_runtime.JSX.Element;
declare function Tooltip({ ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function TooltipTrigger({ ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function TooltipContent({ className, sideOffset, children, ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Content>): react_jsx_runtime.JSX.Element;

type SidebarContextProps = {
    state: "expanded" | "collapsed";
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
};
declare function useSidebar(): SidebarContextProps;
declare function SidebarProvider({ defaultOpen, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }: React$1.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}): react_jsx_runtime.JSX.Element;
declare function Sidebar({ side, variant, collapsible, className, children, ...props }: React$1.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
}): react_jsx_runtime.JSX.Element;
declare function SidebarTrigger({ className, onClick, ...props }: React$1.ComponentProps<typeof Button>): react_jsx_runtime.JSX.Element;
declare function SidebarRail({ className, ...props }: React$1.ComponentProps<"button">): react_jsx_runtime.JSX.Element;
declare function SidebarInset({ className, ...props }: React$1.ComponentProps<"main">): react_jsx_runtime.JSX.Element;
declare function SidebarInput({ className, ...props }: React$1.ComponentProps<typeof Input>): react_jsx_runtime.JSX.Element;
declare function SidebarHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarSeparator({ className, ...props }: React$1.ComponentProps<typeof Separator>): react_jsx_runtime.JSX.Element;
declare function SidebarContent({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarGroup({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarGroupLabel({ className, asChild, ...props }: React$1.ComponentProps<"div"> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function SidebarGroupAction({ className, asChild, ...props }: React$1.ComponentProps<"button"> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function SidebarGroupContent({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarMenu({ className, ...props }: React$1.ComponentProps<"ul">): react_jsx_runtime.JSX.Element;
declare function SidebarMenuItem({ className, ...props }: React$1.ComponentProps<"li">): react_jsx_runtime.JSX.Element;
declare const sidebarMenuButtonVariants: (props?: ({
    variant?: "default" | "outline" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function SidebarMenuButton({ asChild, isActive, variant, size, tooltip, className, ...props }: React$1.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React$1.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>): react_jsx_runtime.JSX.Element;
declare function SidebarMenuAction({ className, asChild, showOnHover, ...props }: React$1.ComponentProps<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function SidebarMenuBadge({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarMenuSkeleton({ className, showIcon, ...props }: React$1.ComponentProps<"div"> & {
    showIcon?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function SidebarMenuSub({ className, ...props }: React$1.ComponentProps<"ul">): react_jsx_runtime.JSX.Element;
declare function SidebarMenuSubItem({ className, ...props }: React$1.ComponentProps<"li">): react_jsx_runtime.JSX.Element;
declare function SidebarMenuSubButton({ asChild, size, isActive, className, ...props }: React$1.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function Skeleton({ className, ...props }: React.ComponentProps<"div">): react_jsx_runtime.JSX.Element;

declare function Slider({ className, defaultValue, value, min, max, ...props }: React$1.ComponentProps<typeof SliderPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare const Toaster: ({ ...props }: ToasterProps) => react_jsx_runtime.JSX.Element;

declare function Switch({ className, ...props }: React$1.ComponentProps<typeof SwitchPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare function Table({ className, ...props }: React$1.ComponentProps<"table">): react_jsx_runtime.JSX.Element;
declare function TableHeader({ className, ...props }: React$1.ComponentProps<"thead">): react_jsx_runtime.JSX.Element;
declare function TableBody({ className, ...props }: React$1.ComponentProps<"tbody">): react_jsx_runtime.JSX.Element;
declare function TableFooter({ className, ...props }: React$1.ComponentProps<"tfoot">): react_jsx_runtime.JSX.Element;
declare function TableRow({ className, ...props }: React$1.ComponentProps<"tr">): react_jsx_runtime.JSX.Element;
declare function TableHead({ className, ...props }: React$1.ComponentProps<"th">): react_jsx_runtime.JSX.Element;
declare function TableCell({ className, ...props }: React$1.ComponentProps<"td">): react_jsx_runtime.JSX.Element;
declare function TableCaption({ className, ...props }: React$1.ComponentProps<"caption">): react_jsx_runtime.JSX.Element;

declare function Tabs({ className, ...props }: React$1.ComponentProps<typeof TabsPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function TabsList({ className, ...props }: React$1.ComponentProps<typeof TabsPrimitive.List>): react_jsx_runtime.JSX.Element;
declare function TabsTrigger({ className, ...props }: React$1.ComponentProps<typeof TabsPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function TabsContent({ className, ...props }: React$1.ComponentProps<typeof TabsPrimitive.Content>): react_jsx_runtime.JSX.Element;

declare function Textarea({ className, ...props }: React$1.ComponentProps<"textarea">): react_jsx_runtime.JSX.Element;

declare const toggleVariants: (props?: ({
    variant?: "default" | "outline" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Toggle({ className, variant, size, ...props }: React$1.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>): react_jsx_runtime.JSX.Element;

declare function ToggleGroup({ className, variant, size, children, ...props }: React$1.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>): react_jsx_runtime.JSX.Element;
declare function ToggleGroupItem({ className, children, variant, size, ...props }: React$1.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>): react_jsx_runtime.JSX.Element;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Alert, AlertDescription, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger, AlertTitle, AspectRatio, Avatar, AvatarBadge, AvatarFallback, AvatarIcon, AvatarImage, Badge, Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, Checkbox, Collapsible, CollapsibleContent, CollapsibleTrigger, Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut, ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuPortal, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, HoverCard, HoverCardContent, HoverCardTrigger, IconButton, Input, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, Label, Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarLabel, MenubarMenu, MenubarPortal, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, Progress, RadioGroup, RadioGroupItem, ResizableHandle, ResizablePanel, ResizablePanelGroup, ScrollArea, ScrollBar, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, Separator, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, Skeleton, Slider, Switch, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Toaster, Toggle, ToggleGroup, ToggleGroupItem, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, badgeVariants, buttonVariants, iconButtonVariants, navigationMenuTriggerStyle, toggleVariants, useFormField, useSidebar };
