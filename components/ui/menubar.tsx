"use client"

import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const MenubarMenu = MenubarPrimitive.Menu

const MenubarGroup = MenubarPrimitive.Group

const MenubarPortal = MenubarPrimitive.Portal

const MenubarSub = MenubarPrimitive.Sub

const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-14 items-center space-x-2 rounded-3xl border border-white/30 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-3 shadow-xl",
      className
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-2xl px-5 py-3 text-sm font-semibold outline-none focus:bg-gradient-to-r focus:from-blue-50 focus:to-indigo-50 dark:focus:from-blue-900/20 dark:focus:to-indigo-900/20 focus:text-blue-700 dark:focus:text-blue-300 data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-50 data-[state=open]:to-indigo-50 dark:data-[state=open]:from-blue-900/20 dark:data-[state=open]:to-indigo-900/20 data-[state=open]:text-blue-700 dark:data-[state=open]:text-blue-300 transition-all duration-300",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-2xl px-4 py-3 text-sm outline-none focus:bg-gradient-to-r focus:from-blue-50 focus:to-indigo-50 dark:focus:from-blue-900/20 dark:focus:to-indigo-900/20 focus:text-blue-700 dark:focus:text-blue-300 data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-50 data-[state=open]:to-indigo-50 dark:data-[state=open]:from-blue-900/20 dark:data-[state=open]:to-indigo-900/20 data-[state=open]:text-blue-700 dark:data-[state=open]:text-blue-300 transition-all duration-300",
      inset && "pl-10",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-5 w-5" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-3xl border border-white/30 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-3 text-popover-foreground shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-3xl border border-white/30 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-3 text-popover-foreground shadow-2xl data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-2xl px-4 py-3 text-sm outline-none focus:bg-gradient-to-r focus:from-blue-50 focus:to-indigo-50 dark:focus:from-blue-900/20 dark:focus:to-indigo-900/20 focus:text-blue-700 dark:focus:text-blue-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-all duration-300",
      inset && "pl-10",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:bg-gradient-to-r focus:from-blue-50 focus:to-indigo-50 dark:focus:from-blue-900/20 dark:focus:to-indigo-900/20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-all duration-300",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-4 flex h-5 w-5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {props.children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:bg-gradient-to-r focus:from-blue-50 focus:to-indigo-50 dark:focus:from-blue-900/20 dark:focus:to-indigo-900/20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-all duration-300",
      className
    )}
    {...props}
  >
    <span className="absolute left-4 flex h-5 w-5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-3 w-3 fill-blue-600 dark:fill-blue-400 text-blue-600 dark:text-blue-400" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {props.children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300",
      inset && "pl-10",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-2 my-2 h-px bg-gray-200/50 dark:bg-gray-700/50", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-gray-500 dark:text-gray-400", className)}
      {...props}
    />
  )
}
MenubarShortcut.displayName = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarGroup,
  MenubarPortal,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarRadioGroup,
}
