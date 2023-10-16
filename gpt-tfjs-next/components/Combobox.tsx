"use client"
 
import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
 
interface ICombobox {
    options: {value: string, text: string}[]
    param: string
}

export default function Combobox({ options, param }: ICombobox) {
  const [open, setOpen] = React.useState(false)
  const searchParams = useSearchParams()
    const value = searchParams.get(param)

    const params = Array
        .from(searchParams.entries(), ([key, value]) => [key, value])
        .filter(([key, _]) => key !== param)
        .reduce( (acc, cur) => `${acc}&${cur[0]}=${cur[1]}`, '')
    console.log(params);
 
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((opt) => opt.value === value)?.text
            : `Select ${param}...`
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Select ${param}...`} />
          <CommandEmpty>Not found.</CommandEmpty>
          <CommandGroup>
            {options.map((opt) => (
              <CommandItem
                key={opt.value}
                onSelect={() => setOpen(false)}
              >
                <Link href={`?${param}=${opt.value}${params}`} className={cn("mr-2 w-full")}>
                    {opt.text}
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}