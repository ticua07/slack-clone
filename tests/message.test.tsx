import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Message } from '../components/Messages'
import { CombinedMessage, ProfileWithImage } from '@/types/types'

const fakeUser = {
  pfp: "",
  created_at: Date(),
  description: "Mock user",
  pronouns: "She/Her",
  display_name: "Sofía",
  username: "sof1",
  id: crypto.randomUUID()
} as ProfileWithImage

const DEFAULT_USER_IMAGE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=ys"


test('Check if message renders correctly', () => {
  const fakeMessage: CombinedMessage = {
    id: crypto.randomUUID(),
    channel_id: crypto.randomUUID(),
    user: { ...fakeUser },
    created_at: Date(),
    sender_id: fakeUser.id,

    content: "Hola mundo!",
    is_image: false,
  }

  // context is null because we don't need it on this test
  render(<Message message={fakeMessage} context={null} />)

  const name = screen.getByText("Sofía")
  const content = screen.getByText('Hola mundo!');
  const pfp = screen.getByRole("img")

  expect(pfp).toBeInstanceOf(HTMLImageElement)

  expect((pfp as HTMLImageElement).src).toBe(DEFAULT_USER_IMAGE)
  expect(name).toBeDefined()
  expect(content).toBeDefined()
})


test('Check if markdown on message renders correctly', () => {
  const fakeMessage: CombinedMessage = {
    id: crypto.randomUUID(),
    channel_id: crypto.randomUUID(),
    user: { ...fakeUser },
    created_at: Date(),
    sender_id: fakeUser.id,

    content: "Esto es **markdown**, los # Titulos no funcionan!",
    is_image: false,
  }

  // context is null because we don't need it on this test
  const { container } = render(<Message message={fakeMessage} context={null} />)

  const content = container.querySelector("p.font-chat")

  expect(content).toBeDefined()
  expect(content!.innerHTML).toBe("Esto es <strong>markdown</strong>, los # Titulos no funcionan!")
})