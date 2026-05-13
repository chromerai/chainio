import { getAnthropicModels } from './anthropic/actions';
import { getOpenAIModels } from './openai/actions';
//import { getGeminiModels } from './gemini/actions';

// async function test() {
//   const models = await getgeminiModels();
//   console.log(JSON.stringify(models, null, 2));
// }

// test();

// async function test() {
//   const models = await getOpenAIModels();
//   console.log(JSON.stringify(models, null, 2));
// }

// test();


async function test() {
  console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY);
  const models = await getAnthropicModels();
  console.log(JSON.stringify(models, null, 2));
}

test();
