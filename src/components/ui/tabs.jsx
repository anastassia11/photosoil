'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn('inline-flex items-center justify-center', className)}
		{...props}
	/>
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			'text-base disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600',
			className
		)}
		{...props}
	/>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			className
		)}
		{...props}
	/>
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
