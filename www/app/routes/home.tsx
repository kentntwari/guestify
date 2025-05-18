import { nanoid } from "nanoid";
import { IKContext, IKImage } from "imagekitio-react";

import { Link } from "react-router";
import { useNavigate } from "react-router";

import { ImageKitResources } from "entities/images";
import { SignedIn, SignedOut, SignInButton } from "@clerk/react-router";

const kit = new ImageKitResources();

const features = [
  "Create events seamlessly with your own unique touch",
  "Receive automated reminders to stay on track",
  "Gain insights into RSVP rates, engagement, and attendance trends",
  "Export guest lists and attendance details in PDF or CSV formats",
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <IKContext urlEndpoint={kit.endpoint}>
      <main className="container mx-auto 3xl:max-w-[1588px] xl:pt-10 xl:pb-16">
        <header className="space-y-44">
          <nav className="space-y-1.5">
            <div
              className="capitalize font-medium xl:text-center xl:text-[240px] xl:leading-[240px] xl:tracking-[0.5px] text-primary-200"
              onClick={() => navigate("/")}
            >
              <span>Guestify.</span>
            </div>
            <div className="w-fit xl:space-x-10 xl:mx-auto">
              <a href="#features" className="uppercase text-primary-200">
                Features
              </a>
              <a href="#contact" className="uppercase text-primary-200">
                Contact us
              </a>
            </div>
          </nav>

          <div className="grid grid-cols-2 gap-x-2 xl:*:max-w-[790px] xl:*:h-[39rem] xl:*:rounded-[40px]">
            <div className="col-start-1 overflow-clip bg-primary-800">
              <IKImage
                path={kit.path["landing-page"].header}
                lqip={{ active: true }}
                loading="lazy"
                transformation={[
                  {
                    width: "790",
                    height: "624",
                  },
                  { progressive: "true" },
                ]}
                alt={kit.alt["landing-page"].header}
                width="790"
                height="624"
                className="w-full h-full object-cover text-primary-200 &:alt:text-center"
              />
            </div>

            <div className="bg-primary-300 col-start-2 p-8 flex flex-col justify-between">
              <p className="text-2xl text-pretty text-primary-900">
                We make event planning effortless by streamlining guest
                management. Whether you’re organizing a wedding, corporate
                event, or private gathering, we help you stay organized, save
                time, and enjoy a seamless experience.
              </p>

              <SignedOut>
                <SignInButton />
              </SignedOut>
            </div>
          </div>
        </header>

        <section id="cta" className="xl:mt-[21.25rem]">
          <h2 className="3xl:max-w-[1349px] mx-auto font-medium text-3xl text-primary-200 text-pretty text-center">
            Make every event uniquely yours. From personalized invitations to
            tailored guest management, we provide the tools to plan effortlessly
            and create memorable experiences.
          </h2>
        </section>

        <section
          id="features"
          className="xl:mt-[21.25rem] grid xl:grid-cols-3 xl:grid-rows-2 xl:gap-2  xl:*:rounded-[40px]"
        >
          <div className="hidden xl:block xl:col-start-1 xl:row-start-1 xl:row-span-2 overflow-clip">
            <IKImage
              path={kit.path["landing-page"].features}
              lqip={{ active: true }}
              loading="lazy"
              transformation={[
                {
                  width: "595",
                  height: "848",
                  progressive: "true",
                },
              ]}
              alt={kit.alt["landing-page"].features}
              className="w-full h-full object-cover text-primary-200"
            />
          </div>
          {features.map((data, index) => (
            <div
              key={nanoid()}
              className="xl:col-span-1 xl:p-8 bg-primary-300 flex flex-col justify-between xl:*:text-2xl xl:*:text-pretty"
            >
              <span>{index + 1}</span>
              <p className="xl:max-w-96">{data}</p>
            </div>
          ))}
        </section>

        <div className="xl:mt-[21.25rem] w-fit xl:mx-auto xl:flex xl:flex-col xl:items-center xl:space-y-6">
          <p className="font-medium text-3xl text-primary-200">
            Sounds interesting?
          </p>
          <Link
            to={{ pathname: "/events" }}
            className="w-fit flex items-center justify-center bg-primary-500 min-w-[20rem] h-[4rem] px-3 rounded-full uppercase font-semibold text-xl text-black"
          >
            Get started for free
          </Link>
        </div>

        <section id="slogan" className="mt-[21.25rem]">
          <h3 className="text-3xl font-medium text-primary-200 text-center">
            Plan smarter <br />
            Personalize your event <br /> Make it unforgettable
          </h3>
        </section>

        <footer className="mt-[21.25em] space-y-1.5">
          <div
            className="capitalize font-medium xl:text-center xl:text-[240px] xl:leading-[240px] xl:tracking-[0.5px] text-primary-200"
            onClick={() => navigate("/")}
          >
            <span>Guestify.</span>
          </div>
          <div className="w-fit xl:space-x-10 xl:mx-auto">
            <a href="#features" className="uppercase text-primary-200">
              Features
            </a>
            <a href="#contact" className="uppercase text-primary-200">
              Contact us
            </a>
            <a href="#privacy-policy" className="uppercase text-primary-200">
              Privacy Policy
            </a>
          </div>
        </footer>
      </main>
    </IKContext>
  );
}
