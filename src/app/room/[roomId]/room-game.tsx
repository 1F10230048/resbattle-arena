'use client'
import { IconButton } from '@/components/ui/IconButton'
import { Loading } from '@/components/ui/Loading'
import TextContent from '@/components/ui/textContent'
import { useMessage } from '@/hooks/useMessage'
import { useUser } from '@/hooks/useUser'
import { apiClient } from '@/lib/apiClient'
import type { JudgeResult } from '@/types/judge'
import type { Room } from '@/types/room'
import { IconBan, IconLoader2, IconSend, IconUser } from '@tabler/icons-react'
import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { twJoin } from 'tailwind-merge'

type RoomGameProps = {
  room: Room
  userId: string
  userPosition: 1 | 2
}

export const RoomGame: FC<RoomGameProps> = ({ room, userId, userPosition }) => {
  const [messageInput, setMessageInput] = useState('')
  const enemyUserId = userPosition === 1 ? room.player2_id : room.player1_id
  const { user: enemyUser } = useUser(enemyUserId ?? '')
  const myPosition = userPosition === 1 ? room.player1_position : room.player2_position
  const { messages, isError, isLoading } = useMessage(room.id)
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [result, setResult] = useState<JudgeResult>()
  const sendMessage = async () => {
    setMessageInput('')
    setIsSending(true)
    const res = await apiClient.api.message.send
      .$post({
        json: { roomId: room.id, playerId: userId, message: messageInput },
      })
      .finally(() => {
        setIsSending(false)
      })
    const aiData = await res.json()
    setResult(aiData.judgeResult)
  }

  const turnUser = useMemo(() => {
    if (messages?.length === 0) return room.player2_id
    const lastMessageUser = messages?.at(-1)?.player_id
    return lastMessageUser === room.player1_id ? room.player2_id : room.player1_id
  }, [messages, room.player1_id, room.player2_id])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [messageInput])

  if (isLoading) return <Loading />
  return (
    <div className="relative flex h-full grow flex-col gap-y-8 pb-16">
      <div className="flex flex-col items-center gap-y-2">
        <h2 className="font-bold text-lg">
          <span>｢{room.topic}について｣</span> -{' '}
          <span className={twJoin(myPosition === 'agree' ? 'text-blue-500' : 'text-red-500')}>
            {myPosition === 'agree' ? '賛成' : '反対'}
          </span>
        </h2>
        <p>
          現在
          {room.player1_id === userId
            ? result?.info.advantageRate.player1 && result?.info.advantageRate.player1 >= 50
              ? '優勢です！'
              : '劣勢です…'
            : result?.info.advantageRate.player2 && result?.info.advantageRate.player2 >= 50
              ? '優勢です！'
              : '劣勢です…'}
        </p>
        <p className="flex items-center gap-x-2 text-foreground-400">
          vs <IconUser size={20} /> {enemyUser?.name}
        </p>
      </div>
      {isLoading || messages !== undefined ? (
        <div className="flex flex-col gap-y-2 overflow-y-auto">
          {messages?.map?.((message) => (
            <div
              key={message.msg_id}
              className={twJoin(
                'w-fit max-w-[80%] rounded-md px-4 py-2',
                message.player_id === enemyUserId && 'bg-background-50',
                message.player_id === userId && 'text ml-auto bg-accent text-white',
              )}
            >
              <TextContent textContent={message.message} />
            </div>
          ))}
          {turnUser !== userId && (
            <div
              className={twJoin(
                'flex w-fit max-w-[80%] space-x-1 rounded-md px-4 py-2',
                'bg-background-50',
                'text bg-accent text-white',
              )}
            >
              <span
                className={twJoin('animate-bounce text-3xl text-black delay-100')}
                style={{ animationDelay: '100ms' }}
              >
                .
              </span>
              <span
                className={twJoin('animate-bounce text-3xl text-black delay-300')}
                style={{ animationDelay: '200ms' }}
              >
                .
              </span>
              <span
                className={twJoin('animate-bounce text-3xl text-black delay-500')}
                style={{ animationDelay: '300ms' }}
              >
                .
              </span>
            </div>
          )}
        </div>
      ) : (
        <Loading />
      )}
      <div className="absolute bottom-0 flex w-full gap-x-2">
        <textarea
          ref={textareaRef}
          value={messageInput}
          rows={1}
          maxLength={400}
          disabled={isSending || turnUser !== userId}
          onChange={(e) => setMessageInput(e.currentTarget.value)}
          placeholder={turnUser === userId ? 'メッセージを送信' : '相手のターンです'}
          className={twJoin(
            'shrink grow rounded-lg border border-background-100 bg-background-50 p-2 text-sm outline-0',
            'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            turnUser !== userId && 'cursor-not-allowed placeholder:text-accent-200',
            'resize-none overflow-hidden',
          )}
        />
        <IconButton
          icon={turnUser !== userId ? IconBan : isSending ? IconLoader2 : IconSend}
          onClick={sendMessage}
          disabled={isSending || turnUser !== userId}
          iconClassName={twJoin(isSending && 'animate-spin')}
        />
      </div>
    </div>
  )
}
