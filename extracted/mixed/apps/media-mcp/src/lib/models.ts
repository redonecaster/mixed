export type ProviderId='kie'|'cometapi';
export type MediaType='image'|'video';
export const MODELS={
 'gpt-image-2-6/flare-text-to-image':{type:'image' as const,providers:['kie','cometapi'] as ProviderId[],providerModel:{kie:process.env.KIE_IMAGE_MODEL||'gpt-image-2-6/flare-text-to-image',cometapi:process.env.COMETAPI_IMAGE_MODEL||'gpt-image-2.6-flare-text-to-image'},aliases:['gpt-image-2.6/flare-text-to-image']},
 'grok-imagine-video-1-5-preview':{type:'video' as const,providers:['kie','cometapi'] as ProviderId[],providerModel:{kie:process.env.KIE_VIDEO_MODEL||'grok-imagine-video-1-5-preview',cometapi:process.env.COMETAPI_VIDEO_MODEL||'grok-imagine-video-1-5-preview'},aliases:['grok-imagine-video-1.5-preview']}
};
export function resolveModel(name:string){for(const [canonical,m] of Object.entries(MODELS))if(name===canonical||m.aliases.includes(name))return {canonical,...m};return null;}
