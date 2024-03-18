import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  private cookieStore: { [key: string]: string } = {};
  private clientReq: any;
  private isBrowser: boolean = false;

  constructor(
    @Inject('req') private readonly req: any,
    @Inject(PLATFORM_ID) platformId: string
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('cookie service');
    this.handleCookies();
    this.setUserID();
  }

  public async handleCookies() {
    console.log('handleCookies()');
    this.clientReq = this.isBrowser ? this.req : null;
    if (this.isBrowser) {
      if (this.clientReq) {
        this.parseCookies(this.clientReq.cookies);
      } else {
        this.parseCookies(document.cookie);
      }
    }
  }

  private parseCookies(cookies: any) {
    this.cookieStore = {};
    if (!!cookies === false) {
      return;
    }
    let cookiesArr = cookies.split(';');
    for (const cookie of cookiesArr) {
      const cookieArr = cookie.split('=');
      this.cookieStore[cookieArr[0].trim()] = cookieArr[1];
    }
  }

  public async get(key: string) {
    console.log('get()');
    return !!this.cookieStore[key] ? this.cookieStore[key] : null;
  }

  public async set(key: string, value: string, expiresInSeconds?: string) {
    console.log('set()');

    if (this.isBrowser) {
      let cookieString = `${key}=${value}`;

      // Add the 'expires' attribute if 'expiresInSeconds' parameter is provided
      if (expiresInSeconds) {
        // Extract numeric value from the string
        const expiresInSecondsNumeric = parseInt(expiresInSeconds, 10);

        // Ensure it's a valid numeric value
        if (!isNaN(expiresInSecondsNumeric)) {
          const expirationDate = new Date(
            Date.now() + expiresInSecondsNumeric * 1000
          );
          const expiresDateString = expirationDate.toUTCString();
          cookieString += `; expires=${expiresDateString}`;
        }
      }

      // Set the cookie using the appropriate method based on the environment
      if (this.req !== null) {
        // Server-side rendering environment (e.g., Next.js)
        this.req.res.setHeader('Set-Cookie', [cookieString]);
      } else {
        // Client-side rendering environment
        document.cookie = cookieString;
      }

      // Update the cookieStore with the new cookie
      this.cookieStore[key] = value;
    }
  }

  public remove(key: string) {
    if (this.isBrowser) {
      if (this.req !== null) {
        // For server-side (Node.js), set an expired cookie to remove it
        const expiredCookieString = `${key}=; expires=${new Date(
          0
        ).toUTCString()}`;
        this.req.res.setHeader('Set-Cookie', [expiredCookieString]);
      } else {
        // For client-side (browser), set an expired cookie to remove it
        document.cookie = `${key}=; expires=${new Date(0).toUTCString()}`;
      }

      // Remove the cookie from the cookieStore
      delete this.cookieStore[key];
    }
  }

  public async checkCookie(): Promise<boolean> {
    const token = await this.get('token');
    return !!token;
  }

  public async setUserID() {
    if (this.isBrowser) {
      let userID = await this.get('userID');
      if (!userID) {
        userID = this.generateUserID();
        await this.set('userID', userID, '31536000'); // Expires in 1 year
      }
    }
  }

  public async getUserID() {
    if (this.isBrowser) {
      let userID = await this.get('userID');
      if (userID) {
        return userID;
      }
      return null;
    }
    return null;
  }

  private generateUserID() {
    // Generate a random alphanumeric string
    return Math.random().toString(36).substr(2, 9); // Adjust length as needed
  }
}
