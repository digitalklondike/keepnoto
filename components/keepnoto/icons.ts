import type { IconSvgElement } from "@hugeicons/react";
import {
  Add01Icon,
  Archive01Icon,
  BookOpen01Icon,
  Bookmark02Icon,
  Calendar03Icon,
  Cancel01Icon,
  CheckIcon,
  ChevronDownIcon,
  Copy01Icon,
  Edit02Icon,
  ExternalLinkIcon,
  FileImageIcon,
  FilePinIcon,
  Folder01Icon,
  Globe02Icon,
  Link01Icon,
  Search01Icon,
  Share08Icon,
  Sorting05Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";

export type AppIcon = IconSvgElement;

export const Icons = {
  add: Add01Icon,
  archive: Archive01Icon,
  bookmark: Bookmark02Icon,
  book: BookOpen01Icon,
  calendar: Calendar03Icon,
  cancel: Cancel01Icon,
  check: CheckIcon,
  chevronDown: ChevronDownIcon,
  copy: Copy01Icon,
  edit: Edit02Icon,
  external: ExternalLinkIcon,
  fileImage: FileImageIcon,
  folder: Folder01Icon,
  globe: Globe02Icon,
  link: Link01Icon,
  pin: FilePinIcon,
  search: Search01Icon,
  share: Share08Icon,
  sort: Sorting05Icon,
  tag: Tag01Icon,
} satisfies Record<string, AppIcon>;

export const BookmarkIcon = Bookmark02Icon;