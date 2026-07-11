import type { IconSvgElement } from "@hugeicons/react";
import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import Archive04Icon from "@hugeicons/core-free-icons/Archive04Icon";
import BookOpen01Icon from "@hugeicons/core-free-icons/BookOpen01Icon";
import Bookmark02Icon from "@hugeicons/core-free-icons/Bookmark02Icon";
import Calendar03Icon from "@hugeicons/core-free-icons/Calendar03Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import CheckIcon from "@hugeicons/core-free-icons/CheckIcon";
import ChevronDownIcon from "@hugeicons/core-free-icons/ChevronDownIcon";
import Copy01Icon from "@hugeicons/core-free-icons/Copy01Icon";
import Edit02Icon from "@hugeicons/core-free-icons/Edit02Icon";
import ExternalLinkIcon from "@hugeicons/core-free-icons/ExternalLinkIcon";
import EyeIcon from "@hugeicons/core-free-icons/EyeIcon";
import EyeOffIcon from "@hugeicons/core-free-icons/EyeOffIcon";
import FileImageIcon from "@hugeicons/core-free-icons/FileImageIcon";
import FilePinIcon from "@hugeicons/core-free-icons/FilePinIcon";
import Folder01Icon from "@hugeicons/core-free-icons/Folder01Icon";
import Globe02Icon from "@hugeicons/core-free-icons/Globe02Icon";
import Link01Icon from "@hugeicons/core-free-icons/Link01Icon";
import Refresh01Icon from "@hugeicons/core-free-icons/Refresh01Icon";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import Share08Icon from "@hugeicons/core-free-icons/Share08Icon";
import Sorting05Icon from "@hugeicons/core-free-icons/Sorting05Icon";
import Tag01Icon from "@hugeicons/core-free-icons/Tag01Icon";
import Camera01Icon from "@hugeicons/core-free-icons/Camera01Icon";
import LockPasswordIcon from "@hugeicons/core-free-icons/LockPasswordIcon";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import UserIcon from "@hugeicons/core-free-icons/UserIcon";
import Logout01Icon from "@hugeicons/core-free-icons/Logout01Icon";
import MoreVerticalIcon from "@hugeicons/core-free-icons/MoreVerticalIcon";
import Delete02Icon from "@hugeicons/core-free-icons/Delete02Icon";

export type AppIcon = IconSvgElement;

export const Icons = {
  add: Add01Icon,
  archive: Archive04Icon,
  restore: Refresh01Icon,
  bookmark: Bookmark02Icon,
  book: BookOpen01Icon,
  calendar: Calendar03Icon,
  camera: Camera01Icon,
  cancel: Cancel01Icon,
  check: CheckIcon,
  chevronDown: ChevronDownIcon,
  copy: Copy01Icon,
  edit: Edit02Icon,
  external: ExternalLinkIcon,
  eye: EyeIcon,
  eyeOff: EyeOffIcon,
  fileImage: FileImageIcon,
  folder: Folder01Icon,
  globe: Globe02Icon,
  link: Link01Icon,
  lock: LockPasswordIcon,
  mail: Mail01Icon,
  logout: Logout01Icon,
  more: MoreVerticalIcon,
  delete: Delete02Icon,
  pin: FilePinIcon,
  search: Search01Icon,
  share: Share08Icon,
  sort: Sorting05Icon,
  tag: Tag01Icon,
  user: UserIcon,
} satisfies Record<string, AppIcon>;

export const BookmarkIcon = Bookmark02Icon;
