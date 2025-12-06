# R2 Bucket Manager

A modern Next.js application for managing Cloudflare R2 bucket objects with an intuitive interface. Featuring file uploads, mass deletions, and multi-bucket support.

![Bucket Manager](https://static.ragna.io/bucket-manager/manager-overview.png)

## Features

- **Multi-Bucket Support**: Switch between multiple R2 buckets from a single interface
- **File Upload**: Drag-and-drop or click to upload files to your R2 buckets
- **Batch Operations**: Select and delete multiple objects at once
- **Mass Deletion**: Delete all objects from a bucket with confirmation
- **Pagination**: Load more objects as needed with "Load More" functionality
- **Object Details**: View object size, last modified date, and full key paths
- **Modern UI**: Clean interface using Radix UI components and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: TailwindCSS 4 with Radix UI components
- **Storage**: Cloudflare R2 via AWS SDK S3 client
- **File Handling**: react-dropzone for uploads
- **UI Components**: Radix UI primitives with shadcn/ui patterns

## Setup

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**

    Copy the `.env.example` and rename it to `.env` in the root directory:

    ```env
    R2_ACCOUNT_ID="your_account_id"
    R2_ACCESS_KEY_ID="your_access_key_id"
    R2_SECRET_ACCESS_KEY="your_secret_access_key"
    R2_BUCKET_NAME="your_default_bucket_name"
    ```

    You can obtain these credentials from your Cloudflare dashboard under R2 settings.

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

4.  **Open your browser:**

    Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1.  **Select a Bucket**: Choose from available R2 buckets in your account
2.  **Upload Files**: Drag and drop files or click to browse and upload
3.  **View Objects**: Browse through your bucket objects with pagination
4.  **Select Objects**: Use checkboxes to select individual objects or select all
5.  **Delete Operations**:
    - **Delete Selected**: Remove specific objects you've selected
    - **Delete ALL Objects**: Clear entire bucket (with confirmation dialog)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
