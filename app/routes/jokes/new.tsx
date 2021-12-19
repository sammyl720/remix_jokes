import { ActionFunction, Link, LoaderFunction, useCatch } from 'remix';
import { redirect, useActionData, json, useTransition } from 'remix';
import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';
import { JokeDisplay } from '../components/joke';

function validataJokeContent(content: string){
  if(content.length < 10){
    return 'That joke is to short'
  }
}

function validataJokeName(name:string){
  if(name.length < 2) {
    return `That joke's name is to short`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  }
}

const badRequest = (data: ActionData) => {
  return json(data, { status: 400 })
};

export const loader: LoaderFunction = async ({
  request
}) => {
  const userId = await getUserId(request);

  if(!userId){
    throw new Response("Unauthorized", {
      status: 401
    });
  }

  return {};
}


export const action: ActionFunction = async ({
  request
}) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const name = form.get("name");
  const content = form.get("content");

  if (
    typeof name !== 'string' ||
    typeof content !== 'string'
  ) {
    return badRequest({
      formError: `Form not submitted correctly`
    })
  }

  const fieldErrors = {
    name: validataJokeName(name),
    content: validataJokeContent(content)
  }

  const fields = { name, content };

  if(Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields })
  }


  const joke = await db.joke.create({ data: { ...fields, jokesterId: userId } });

  return redirect(`/jokes/${joke.id}`);
}

export default function NewJokeRoute(){
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  if(transition.submission){
    const name = transition.submission.formData.get("name");
    const content = transition.submission.formData.get("content");

    if(typeof name === 'string' &&
      typeof content === 'string' &&
      !validataJokeContent(content) &&
      !validataJokeName(name)
      ){
        <JokeDisplay 
          joke={{ name, content}} 
          isOwner={true}
          canDelete={false}
        />
      }
  }
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name: {""}
            <input 
              type="text" 
              name="name"
              defaultValue={actionData?.fields?.name}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.name) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.name ?
                "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              role="alert"
              id="name-error"
            >
              {actionData.fieldErrors.name}
            </p>
          ): null }
        </div>
        <div>
          <label>
            Content: {" "} 
            <textarea
              defaultValue={actionData?.fields?.content}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.content ?
                "content-error" : undefined
              }
              name="content" />
          </label>
          { actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"            
              >
                {actionData.fieldErrors.content}
              </p>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button">Add</button>
        </div>
      </form>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if(caught.status === 401){
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke</p>
        <Link to="/login">Login</Link>
      </div>
    )
  }
}

export function ErrorBoundary(){
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}