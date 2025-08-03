"use client"

import { type FC, useEffect, useRef, useState } from "react"
import { readStreamableValue } from "@ai-sdk/rsc"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Loader2 } from "lucide-react"
import { generate } from "@/lib/actions"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

interface Notification {
  name: string
  message: string
  minutesAgo: number
  initials: string
}

const NotificationItem: FC<Notification> = ({ name, message, minutesAgo, initials }) => (
  <div className="flex items-start gap-4 p-4 border-b last:border-b-0">
    <Avatar className="h-10 w-10 border">
      <AvatarImage src={`/placeholder.svg?height=40&width=40&query=${name.split(" ").join("+")}`} alt={name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
    <div className="grid gap-1">
      <p className="text-sm font-medium leading-none">{name}</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      <p className="text-xs text-muted-foreground">{minutesAgo} minutes ago</p>
    </div>
  </div>
)

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const prevNotificationCount = useRef(0)

  useEffect(() => {
    // Play sound when a new notification is added
    if (notifications.length > 0 && notifications.length > prevNotificationCount.current) {
      audioRef.current?.play().catch((error) => console.error("Audio playback failed:", error))
    }
    prevNotificationCount.current = notifications.length
  }, [notifications])

  const handleGenerate = async () => {
    setIsLoading(true)
    setNotifications([])
    prevNotificationCount.current = 0

    const { object } = await generate("Generate notifications for a busy social media feed.")

    for await (const partialObject of readStreamableValue(object)) {
      if (partialObject?.notifications) {
        const processedNotifications = partialObject.notifications.map((n: { name: { split: (arg0: string) => any[][] } }) => ({
          ...n,
          initials: n.name
            .split(" ")
            .map((part: any[]) => part[0])
            .join("")
            .toUpperCase(),
        }))
        setNotifications(processedNotifications)
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Real-time Notifications</CardTitle>
          </div>
          <CardDescription>Click the button to see notifications stream in with sound.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => <NotificationItem key={index} {...notification} />)
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {isLoading ? "Generating notifications..." : "No notifications yet."}
              </div>
            )}
          </div>
        </CardContent>
        <div className="p-6 border-t">
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Generating..." : "Generate Notifications"}
          </Button>
        </div>
      </Card>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
    </div>
  )
}
