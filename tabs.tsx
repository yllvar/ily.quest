import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TabsDemo() {
  return (
    <Tabs defaultValue="ai" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="ai">
          <Avatar className="h-5 w-5">
            <AvatarImage src="/iLy.svg" />
            <AvatarFallback>iLy</AvatarFallback>
          </Avatar>
          <span className="ml-2">iLy Assistant</span>
        </TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="ai">Make edits to the component here.</TabsContent>
      <TabsContent value="manual">This is the manual tab.</TabsContent>
      <TabsContent value="settings">This is the settings tab.</TabsContent>
    </Tabs>
  )
}

