import Link from 'next/link'
import { useRouter } from 'next/router'

const Footer = () => {
  const router = useRouter()

  return (
    <div>
      <Link href={router.pathname}>
        <div className={'bg-amazon_blue-light hover:bg-amazon_blue-extraLight font-bold text-white text-center p-3 cursor-pointer'}>
          Back to Top
        </div>
      </Link>

      <div className="flex bg-amazon_blue text-gray-100 justify-between sm:justify-evenly py-24 px-3 sm:p-24">
        <div>
          <div className="text-sm sm:text-lg mb-4 font-bold ">Get to Know Us</div>
          <ul className="text-gray-400 text-xs sm:text-sm space-y-1 cursor-pointer">
            <li>About Us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Amazon Cares</li>
            <li>Gift a smile</li>
          </ul>
        </div>

        <div>
          <div className="text-sm sm:text-lg mb-4 font-bold ">Contact Us</div>
          <ul className="text-gray-400 text-xs sm:text-sm space-y-1 cursor-pointer">
            <li>About Us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Amazon Cares</li>
            <li>Gift a smile</li>
          </ul>
        </div>

        <div>
          <div className="text-sm sm:text-lg mb-4 font-bold ">Make Money with Us</div>
          <ul className="text-gray-400 text-xs sm:text-sm space-y-1 cursor-pointer">
            <li>About Us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Amazon Cares</li>
            <li>Gift a smile</li>
          </ul>
        </div>

        <div>
          <div className="text-sm sm:text-lg mb-4 font-bold ">Let Us Help You</div>
          <ul className="text-gray-400 text-xs sm:text-sm space-y-1 cursor-pointer">
            <li>About Us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Amazon Cares</li>
            <li>Gift a smile</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Footer
