import Link from "next/link"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Medstra 🏥
          </Link>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/assessment">Start Assessment</Link>
            </Button>
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
} 