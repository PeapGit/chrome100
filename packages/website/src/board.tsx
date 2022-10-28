import type { cros_target, cros_recovery_image_db } from "chrome-versions";
import { getRecoveryURL } from "./chrome-versions.js";
import { render, h, Fragment } from "https://unpkg.com/preact@latest?module";
import {
  useEffect,
  useState,
} from "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module";
import { apiURL } from "./api.js";
import { root } from "./root.js";

interface BoardData {
  target: cros_target;
  images: cros_recovery_image_db[];
}

const BoardPage = () => {
  const board = new URLSearchParams(location.search).get("board");
  const [boardData, setBoardData] = useState<null | BoardData>(null);

  useEffect(() => {
    if (!board) return;

    const controller = new AbortController();

    (async () => {
      const data = await fetch(
        new URL(`board?board=${encodeURIComponent(board)}`, apiURL),
        {
          signal: controller.signal,
        }
      );
      if (!data.ok) throw new Error("Failure fetching home data.");
      setBoardData(await data.json());
    })().catch(console.error);

    return () => {
      controller.abort();
    };
  }, [board]);

  if (!board)
    return (
      <p>
        You must specify the <code>board</code> search parameter.
      </p>
    );

  return boardData === null ? (
    <p>
      Loading Chrome OS board <code>{board}</code>...
    </p>
  ) : (
    <>
      <a href="/">Back</a>
      <h1>
        Chrome OS board <code>{board}</code>
      </h1>
      <table>
        <thead>
          <th>Platform</th>
          <th>Chrome</th>
          <th>Modified</th>
          <th />
        </thead>
        <tbody>
          {boardData.images
            .sort(
              (a, b) =>
                new Date(a.last_modified).getTime() -
                new Date(b.last_modified).getTime()
            )
            .map((img, i) => (
              <tr key={i}>
                <td>{img.platform}</td>
                <td>{img.chrome}</td>
                <td>{img.last_modified}</td>
                <td>
                  <a href={getRecoveryURL(img)}>Download</a>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
};

render(<BoardPage />, root);