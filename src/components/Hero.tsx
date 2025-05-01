
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <div className="pt-10 sm:pt-16 lg:pt-8 xl:pt-16">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-kenya-black sm:text-5xl md:text-6xl">
                <span className="block">Kenya Police</span>
                <span className="block text-kenya-green">Case Management System</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Ensuring Justice, Accountability, and Service for All Kenyans
              </p>
              <div className="text-xl font-semibold mt-2 text-kenya-red italic">
                "Utumishi Kwa Wote"
              </div>
              <div className="mt-8 sm:mt-10 flex justify-start">
                <div className="rounded-md shadow">
                  <Link to="/report-crime">
                    <Button className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md bg-kenya-red hover:bg-kenya-red/90 text-white">
                      Report a Crime
                    </Button>
                  </Link>
                </div>
                <div className="mt-0 ml-3">
                  <Link to="/track-case">
                    <Button variant="outline" className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-kenya-black hover:bg-gray-50">
                      Track your Case
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-56 w-full bg-kenya-green sm:h-72 md:h-96 lg:w-full lg:h-full relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Kenya Flag Vertical Stripes */}
            <div className="w-full h-full flex">
              <div className="w-1/3 h-full bg-kenya-black"></div>
              <div className="w-1/3 h-full bg-kenya-red"></div>
              <div className="w-1/3 h-full bg-kenya-green"></div>
            </div>
            
            {/* Shield Emblem */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 bg-kenya-white rounded-full flex items-center justify-center border-4 border-kenya-white">
                <div className="w-3/4 h-3/4 bg-kenya-red flex items-center justify-center">
                  <div className="w-3/4 h-3/4 bg-kenya-black flex items-center justify-center">
                    <div className="w-3/4 h-3/4 bg-kenya-white rounded-full">
                      {/* Simplified shield design */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
