import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Label } from "@/components/ui/label"

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-800 to-blue-400 p-6">
      
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <CardContent className="p-8 text-center space-y-6">
          
          {/* Logo / Crest */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
              <Image src={'/images/im_logo.jpeg'} alt="logo" width={200} height={200} />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Welcome to 
            </h1>
            <Label className="flex justify-center text-2xl font-bold text-green-800 text-center w-full ">IMMILAC Aflao</Label>
      <h1 className="text-lg font-bold text-gray-800">
             Voting Portal
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Secure • Transparent • Democratic
            </p>
          </div>

          <div className="space-y-3 mt-4 gap-3">
            <Link href="/login">
              <Button className="w-full bg-green-700 hover:bg-green-800">
                Login to Vote
              </Button>
            </Link>

            <Link href="/forgot-password">
              <Button variant="outline" className="w-full mt-2">
                Forgot Password?
              </Button>
            </Link>
          </div>

        </CardContent>
      </Card>

    </div>
  )
}
