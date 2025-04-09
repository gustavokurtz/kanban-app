import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/register')
  
  // Este código nunca será executado
  return null
}