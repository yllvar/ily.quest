import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function AIAssistant() {
  return (
    <div className="fixed bottom-4 right-4">
      <Avatar className="h-10 w-10">
        <AvatarImage src="/iLy.svg" />
        <AvatarFallback>iLy</AvatarFallback>
      </Avatar>
    </div>
  )
}

