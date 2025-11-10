interface IResourceDetails {
  "landing-page": { header: string; features: string };
}

export class ImageKitResources {
  private _urlEndpoint: string;

  constructor(
    imageKitUrlEndpoint: string = "https://ik.imagekit.io/2rtor9l9w"
  ) {
    this._urlEndpoint = imageKitUrlEndpoint;
  }

  get endpoint() {
    return this._urlEndpoint;
  }

  get path(): IResourceDetails {
    return {
      "landing-page": {
        header:
          "Guestify/woman-making-calls-in-her-office-in-casual-outfit.jpg",
        features: "Guestify/woman-looking-outside-window-on-a-yacht.jpg",
      },
    };
  }

  get alt(): IResourceDetails {
    return {
      "landing-page": {
        header: "Header image of a woman taking calls while in her office",
        features:
          "Features image of a woman looking outside the window whilst on a yacht",
      },
    };
  }
}
