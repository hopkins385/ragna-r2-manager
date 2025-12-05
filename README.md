# R2 Bucket Manager

A Next.js application to mass delete objects from Cloudflare R2 using the S3 compatible TypeScript client.

## Setup

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Configure Environment Variables:
    Create a `.env.local` file in the root directory with the following variables:

    ```env
    R2_ACCOUNT_ID=your_account_id
    R2_ACCESS_KEY_ID=your_access_key_id
    R2_SECRET_ACCESS_KEY=your_secret_access_key
    R2_BUCKET_NAME=your_bucket_name
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

## Usage

1.  Open [http://localhost:3000](http://localhost:3000) with your browser.
2.  The app will list objects from your configured R2 bucket.
3.  Select objects you want to delete.
4.  Click "Delete Selected".
