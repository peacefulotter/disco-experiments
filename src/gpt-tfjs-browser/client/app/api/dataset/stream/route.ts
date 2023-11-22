// @see https://github.com/vercel/next.js/discussions/15453#discussioncomment-6226391
import fs from "fs";

/**
 * Took this syntax from https://github.com/MattMorgis/async-stream-generator
 * Didn't find proper documentation: how come you can iterate on a Node.js ReadableStream via "of" operator?
 * What's "for await"?
 */
async function* nodeStreamToIterator(stream: fs.ReadStream) {
  for await (const chunk of stream) {
    yield chunk;
  }
}

/**
 * Taken from Next.js doc
 * https://nextjs.org/docs/app/building-your-application/routing/router-handlers#streaming
 * Itself taken from mozilla doc
 * https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
 */
function iteratorToStream(
  iterator: AsyncGenerator<any, void, unknown>
): ReadableStream {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        // conversion to Uint8Array is important here otherwise the stream is not readable
        // @see https://github.com/vercel/next.js/issues/38736
        controller.enqueue(new Uint8Array(value));
      }
    },
  });
}

export function streamFile(path: string): ReadableStream {
  const downloadStream = fs.createReadStream(path);
  const data: ReadableStream = iteratorToStream(
    nodeStreamToIterator(downloadStream)
  );
  return data;
}

export function GET(req: Request) {
  // const stats = await fsPromises.stat(zipFilePath);
  // const data: ReadableStream = streamFile(zipFilePath);
  // const res = new NextResponse(data, {
  //   status: 200,
  //   headers: new Headers({
  //     "content-disposition": `attachment; filename=${path.basename(
  //       zipFilePath
  //     )}`,
  //     "content-type": "application/zip",
  //     "content-length": stats.size + "",
  //   }),
  // });
  // return res;
}
