(function(){const v=document.createElement("link").relList;if(v&&v.supports&&v.supports("modulepreload"))return;for(const g of document.querySelectorAll('link[rel="modulepreload"]'))s(g);new MutationObserver(g=>{for(const y of g)if(y.type==="childList")for(const B of y.addedNodes)B.tagName==="LINK"&&B.rel==="modulepreload"&&s(B)}).observe(document,{childList:!0,subtree:!0});function r(g){const y={};return g.integrity&&(y.integrity=g.integrity),g.referrerPolicy&&(y.referrerPolicy=g.referrerPolicy),g.crossOrigin==="use-credentials"?y.credentials="include":g.crossOrigin==="anonymous"?y.credentials="omit":y.credentials="same-origin",y}function s(g){if(g.ep)return;g.ep=!0;const y=r(g);fetch(g.href,y)}})();const{createApp:Ae,ref:A,computed:pe,watch:qe,onMounted:We,nextTick:Le}=Vue,ge={"Xenova/all-MiniLM-L6-v2":{label:"all-MiniLM-L6-v2",dim:384,sizeLabel:"~23 MB",preferredDevice:"wasm",dtype:"q8"},"Xenova/bge-small-en-v1.5":{label:"bge-small-en-v1.5",dim:384,sizeLabel:"~34 MB",preferredDevice:"wasm",dtype:"q8"},"onnx-community/embeddinggemma-300m-ONNX":{label:"EmbeddingGemma-300M",dim:768,sizeLabel:"~195 MB",preferredDevice:"auto",dtype:"q4"},synthetic:{label:"Synthetic Baseline",dim:64,sizeLabel:"0 MB",preferredDevice:"js",dtype:"fp64"}},ve=[{name:"Graph Attention",paragraph:"Neural networks learn rich representations across structured data. Graph attention mechanisms capture asymmetric syntactic and semantic relationships between words in a sequence.",query:"Graph attention mechanisms capture relationships"},{name:"River Bank",paragraph:"Heavy monsoon rains swelled the muddy river overnight, eroding trees along the steep grassy embankment.",query:"The muddy boat reached the river bank"},{name:"Bank Account",paragraph:"Financial institutions verify customer identity before approving wire transfers or updating checking balances.",query:"The customer checked the bank balance"},{name:"Quantum Optics",paragraph:"Entangled photons propagate through nonlinear crystals inside precision laser interferometers.",query:"Entangled photons interfere cleanly inside lasers"}];function ye(m){return String(m||"").trim().split(/\s+/).map(v=>v.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9'-]+$/g,"")).filter(Boolean).slice(0,14)}function Te(m){let v=0;for(let s=0;s<m.length;s++)v+=m[s]*m[s];v=Math.sqrt(v);const r=new Float64Array(m.length);if(v>1e-12)for(let s=0;s<m.length;s++)r[s]=m[s]/v;else m.length&&(r[0]=1);return r}function be(m,v){const r=new Set(ye(m).map(s=>s.toLowerCase()));return v.map((s,g)=>{const y=s.toLowerCase();let B=0;for(let W=0;W<y.length;W++)B+=y.charCodeAt(W)*(W+1);const x=new Float64Array(64);for(let W=0;W<64;W++)x[W]=Math.sin(B*(W+1)*.017)*.5+Math.cos(B*(W+2)*.031)*.3+Math.sin((g+1)*(W+1)*.07)*.12+(r.has(y)?.22*Math.cos(W*.13):0);return Te(x)})}function Se(m){let v=m>>>0;return function(){v|=0,v=v+1831565813|0;let r=Math.imul(v^v>>>15,1|v);return r=r+Math.imul(r^r>>>7,61|r)^r,((r^r>>>14)>>>0)/4294967296}}function ke(m,v){const r=m.length;let s=-1/0;for(let x=0;x<r;x++)v[x]&&m[x]>s&&(s=m[x]);const g=new Float64Array(r);let y=0;for(let x=0;x<r;x++){if(!v[x])continue;const W=Math.exp(m[x]-s);g[x]=W,y+=W}return Array.from(g,x=>y>0?x/y:0)}function _e(m,v){const r=m.length,s=m[0]?.length||64,{topology:g,temperature:y,eduSelfLoops:B,numHeads:x,seed:W}=v,K=Array.from({length:r},(c,f)=>Array.from({length:r},(j,I)=>g==="window1"?Math.abs(f-I)<=1:g==="window2"?Math.abs(f-I)<=2:!0)),ee=Array.from({length:r},(c,f)=>Array.from({length:r},(j,I)=>!(!K[f][I]||!B&&r>1&&f===I))),O=Array.from({length:r},()=>new Array(r).fill(0)),H=Array.from({length:r},()=>new Array(r).fill(0)),P=Array.from({length:r},()=>new Array(r).fill(0));for(let c=0;c<r;c++){for(let f=0;f<r;f++){let j=0;for(let I=0;I<s;I++)j+=m[c][I]*m[f][I];O[c][f]=j,H[c][f]=j/Math.max(.05,y)}P[c]=ke(H[c],ee[c])}const _=32,Y=Array.from({length:r},()=>new Array(r).fill(0));let te=null,R=null,k=null,ae=null,re=null,ne=null;for(let c=0;c<x;c++){const f=Se(W*1009+c*97+s*13),j=Math.sqrt(6/(s+_)),I=Array.from({length:_},()=>{const M=new Float64Array(s);for(let L=0;L<s;L++)M[L]=(f()*2-1)*j;return M}),oe=Math.sqrt(6/(2*_+1)),Q=new Float64Array(2*_);for(let M=0;M<2*_;M++)Q[M]=(f()*2-1)*oe*2;const le=m.map(M=>{const L=new Float64Array(_);for(let F=0;F<_;F++){let $=0;const fe=I[F];for(let J=0;J<s;J++)$+=fe[J]*M[J];L[F]=$}return L}),se=Array.from({length:r},()=>new Array(r).fill(0)),V=Array.from({length:r},()=>new Array(r).fill(0)),E=Array.from({length:r},()=>new Array(r).fill(0));for(let M=0;M<r;M++){for(let L=0;L<r;L++){let F=0;for(let $=0;$<_;$++)F+=Q[$]*le[M][$]+Q[_+$]*le[L][$];se[M][L]=F,V[M][L]=F>=0?F:.2*F}E[M]=ke(V[M],K[M]);for(let L=0;L<r;L++)Y[M][L]+=E[M][L]/x}c===0&&(te=I,R=Q,k=le,ae=se,re=V,ne=E)}const ie=P.map(c=>c.reduce((f,j)=>f+j,0)),ce=Y.map(c=>c.reduce((f,j)=>f+j,0));return{dim:s,embeddings:m,eduMask:ee,gatMask:K,dotCos:O,dotLogits:H,dotAlpha:P,eduRowSums:ie,gatAlpha:Y,gatRowSums:ce,head0W:te,head0A:R,head0Wh:k,head0PreLeaky:ae,head0E:re,head0Alpha:ne}}const je=`
    import { AutoModel, AutoTokenizer, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/dist/transformers.min.js';
    env.allowLocalModels = false;
    env.allowRemoteModels = true;
    env.useBrowserCache = true;

    let cachedModelId = null;
    let cachedBackend = null;
    let tokenizer = null;
    let model = null;

    const cleanAlpha = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    async function ensureLoaded(modelId, meta) {
        if (cachedModelId === modelId && model && tokenizer) {
            return { backend: cachedBackend };
        }
        const fileProgress = new Map();
        const progressCb = (p) => {
            if (!p || !p.file) return;
            if (p.status === 'progress') {
                fileProgress.set(p.file, { loaded: p.loaded || 0, total: p.total || 0 });
            } else if (p.status === 'done') {
                const prev = fileProgress.get(p.file);
                if (prev && prev.total) fileProgress.set(p.file, { loaded: prev.total, total: prev.total });
            } else {
                return;
            }
            let loaded = 0, total = 0;
            for (const v of fileProgress.values()) { loaded += v.loaded; total += v.total; }
            const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
            self.postMessage({ type: 'progress', data: { percent, file: p.file } });
        };

        tokenizer = await AutoTokenizer.from_pretrained(modelId);
        let backend = meta.preferredDevice || 'wasm';
        if (backend === 'auto') {
            let hasGpu = false;
            try { hasGpu = !!('gpu' in navigator && await navigator.gpu.requestAdapter()); } catch {}
            backend = hasGpu ? 'webgpu' : 'wasm';
        }

        const opts = { device: backend, progress_callback: progressCb };
        if (modelId.includes('embeddinggemma')) {
            opts.dtype = 'q4';
            if (backend === 'webgpu') opts.model_file_name = 'model_no_gather';
        } else {
            opts.dtype = backend === 'wasm' ? 'q8' : 'fp32';
        }

        try {
            model = await AutoModel.from_pretrained(modelId, opts);
        } catch (err) {
            if (backend === 'webgpu') {
                backend = 'wasm';
                model = await AutoModel.from_pretrained(modelId, {
                    device: 'wasm',
                    dtype: 'q8',
                    progress_callback: progressCb
                });
            } else {
                throw err;
            }
        }
        cachedModelId = modelId;
        cachedBackend = backend;
        return { backend };
    }

    function l2norm(arr) {
        let s = 0;
        for (let i = 0; i < arr.length; i++) s += arr[i] * arr[i];
        s = Math.sqrt(s);
        const out = new Array(arr.length);
        if (s > 1e-12) {
            for (let i = 0; i < arr.length; i++) out[i] = arr[i] / s;
        } else if (arr.length) {
            out[0] = 1;
            for (let i = 1; i < arr.length; i++) out[i] = 0;
        }
        return out;
    }

    function alignWordsToTokenIndices(queryWords, decodedTokens) {
        const cleanTokens = decodedTokens.map(cleanAlpha);
        const wordTargets = queryWords.map(cleanAlpha).filter(Boolean);
        if (!wordTargets.length || wordTargets.length !== queryWords.length) return null;

        // Walk backward from the end of decodedTokens to locate the query sequence inside [paragraph + query]
        const totalTokens = cleanTokens.length;
        for (let start = Math.max(0, totalTokens - wordTargets.length * 6); start < totalTokens; start++) {
            let ti = start;
            const spans = [];
            let matched = true;
            for (let wi = 0; wi < wordTargets.length; wi++) {
                const target = wordTargets[wi];
                let built = '';
                const indices = [];
                while (ti < totalTokens && built.length < target.length) {
                    if (cleanTokens[ti]) {
                        built += cleanTokens[ti];
                        indices.push(ti);
                    }
                    ti++;
                }
                if (built !== target || !indices.length) {
                    matched = false;
                    break;
                }
                spans.push(indices);
            }
            if (matched) return spans;
        }
        return null;
    }

    self.addEventListener('message', async (e) => {
        const { type, data } = e.data;
        if (type !== 'encode') return;
        const { requestId, modelId, meta, paragraphText, queryWords } = data;
        try {
            const { backend } = await ensureLoaded(modelId, meta);
            const pWords = String(paragraphText || '').trim().split(/\\s+/).filter(Boolean).slice(-120).join(' ');
            const qStr = queryWords.join(' ');
            const fullText = pWords ? (pWords + ' ' + qStr) : qStr;

            let inputs = tokenizer(fullText, { padding: false, truncation: true, max_length: 256 });
            let ids = Array.from(inputs.input_ids.data, Number);
            let decoded = ids.map(id => tokenizer.decode([id], { skip_special_tokens: true }));
            let spans = alignWordsToTokenIndices(queryWords, decoded);

            if (!spans) {
                inputs = tokenizer(qStr, { padding: false, truncation: true, max_length: 128 });
                ids = Array.from(inputs.input_ids.data, Number);
                decoded = ids.map(id => tokenizer.decode([id], { skip_special_tokens: true }));
                spans = alignWordsToTokenIndices(queryWords, decoded);
            }

            let wordVectors = null;
            if (spans && spans.length === queryWords.length) {
                const outputs = await model(inputs);
                const hidden = outputs.last_hidden_state;
                const [, seqLen, dim] = hidden.dims.map(Number);
                const raw = hidden.data;
                wordVectors = spans.map(indices => {
                    const acc = new Float64Array(dim);
                    for (const idx of indices) {
                        const base = idx * dim;
                        for (let d = 0; d < dim; d++) acc[d] += Number(raw[base + d]);
                    }
                    for (let d = 0; d < dim; d++) acc[d] /= indices.length;
                    return l2norm(acc);
                });
            } else {
                const batchInputs = tokenizer(queryWords, { padding: true, truncation: true });
                const outputs = await model(batchInputs);
                const hidden = outputs.last_hidden_state;
                const [batchN, seqLen, dim] = hidden.dims.map(Number);
                const raw = hidden.data;
                const mask = batchInputs.attention_mask ? batchInputs.attention_mask.data : null;
                wordVectors = [];
                for (let b = 0; b < batchN; b++) {
                    const acc = new Float64Array(dim);
                    let cnt = 0;
                    for (let s = 0; s < seqLen; s++) {
                        const mVal = mask ? Number(mask[b * seqLen + s]) : 1;
                        if (mVal > 0) {
                            const base = (b * seqLen + s) * dim;
                            for (let d = 0; d < dim; d++) acc[d] += Number(raw[base + d]);
                            cnt++;
                        }
                    }
                    if (cnt > 0) for (let d = 0; d < dim; d++) acc[d] /= cnt;
                    wordVectors.push(l2norm(acc));
                }
            }

            self.postMessage({
                type: 'encoded',
                data: {
                    requestId,
                    modelId,
                    backend,
                    dim: wordVectors[0]?.length || meta.dim,
                    embeddings: wordVectors
                }
            });
        } catch (err) {
            self.postMessage({
                type: 'error',
                data: { requestId, message: (err && err.message) || String(err) }
            });
        }
    });
    `;Ae({setup(){const m=location.pathname.includes("/cv/"),v=A(!1),r=ve,s=A(ve[0].paragraph),g=A(ve[0].query),y=A("Xenova/all-MiniLM-L6-v2"),B=A("full"),x=A(1),W=A(42),K=A(.25),ee=A(!1),O=A(!1),H=A(0),P=A(""),_=A("Loading all-MiniLM-L6-v2..."),Y=A(""),te=A(64),R=A(null),k=A(null),ae=A(null),re=A(null),ne=A(null),ie=A(null),ce=A(null);let c={queryWords:[],embeddings:[],attention:null},f=null,j=0;const I=pe(()=>ye(g.value)),oe=t=>window.katex?window.katex.renderToString(t,{throwOnError:!1,displayMode:!1}):t,Q=pe(()=>oe("\\alpha_{ij}^{\\text{dot}} = \\text{softmax}_{j \\in \\mathcal{N}_i}\\!\\left(\\frac{\\vec{h}_i \\cdot \\vec{h}_j}{\\tau}\\right)")),le=pe(()=>oe("\\alpha_{ij}^{(k)} = \\text{softmax}_{j \\in \\mathcal{N}_i}\\!\\left(\\text{LeakyReLU}_{0.2}\\!\\left(\\vec{a}^{(k)T}[\\mathbf{W}^{(k)}\\vec{h}_i \\,\\|\\, \\mathbf{W}^{(k)}\\vec{h}_j]\\right)\\right)")),se=pe(()=>{const t=k.value||R.value,e=c.attention,p=c.queryWords;if(!t||!e||t.i>=p.length||t.j>=p.length)return null;const{i:n,j:h}=t,a=e.head0Wh[n],b=e.head0Wh[h],i=new Float64Array(a.length+b.length);return i.set(a,0),i.set(b,a.length),{i:n,j:h,isPinned:!!k.value&&k.value.i===n&&k.value.j===h,sourceWord:p[n],targetWord:p[h],embSource:e.embeddings[n],embTarget:e.embeddings[h],dotCos:e.dotCos[n][h],dotLogit:e.dotLogits[n][h],dotAlpha:e.dotAlpha[n][h],dotMasked:!e.eduMask[n][h],dotRowSum:e.eduRowSums[n],W:e.head0W,a:e.head0A,whiSample:Array.from(a.slice(0,3)).map(q=>q.toFixed(2)).join(", "),concat:i,gatPreLeaky:e.head0PreLeaky[n][h],gatE:e.head0E[n][h],gatMasked:!e.gatMask[n][h],gatAlpha:e.gatAlpha[n][h],gatHead0Alpha:e.head0Alpha[n][h],gatRowSum:e.gatRowSums[n]}});function V(t,e,p,n,h){if(!t||!e)return;const a=t.getContext("2d"),b=a.createImageData(n,p);let i=1/0,q=-1/0;if(h)for(let d=0;d<n&&d<e.length;d++)e[d]<i&&(i=e[d]),e[d]>q&&(q=e[d]);else for(let d=0;d<p&&d<e.length;d++)for(let T=0;T<n&&T<e[d].length;T++)e[d][T]<i&&(i=e[d][T]),e[d][T]>q&&(q=e[d][T]);const G=q-i||1;for(let d=0;d<p;d++)for(let T=0;T<n;T++){const z=((h?e[T]??0:(e[d]&&e[d][T])??0)-i)/G,U=(d*n+T)*4;b.data[U]=Math.round(240*(1-z)),b.data[U+1]=Math.round(90+130*z),b.data[U+2]=245,b.data[U+3]=255}a.putImageData(b,0,0)}qe(se,async t=>{t&&(await Le(),V(ae.value,t.embSource,16,Math.min(64,t.embSource.length),!0),V(re.value,t.embTarget,16,Math.min(64,t.embTarget.length),!0),V(ne.value,t.W,32,Math.min(64,t.W[0]?.length||64),!1),V(ie.value,t.concat,16,Math.min(64,t.concat.length),!0),V(ce.value,t.a,16,Math.min(64,t.a.length),!0))});function E(t,e,p){const n=d3.select("#token-graph-svg"),h=new Set;t!=null&&h.add(t),e!=null&&h.add(e),n.selectAll("g.token-node-group rect.token-pill").attr("stroke",a=>h.has(a.i)?p?"#dc2626":"#0f172a":"#2563eb").attr("stroke-width",a=>h.has(a.i)?3:1.5),n.selectAll("path.attn-arc").attr("stroke-opacity",a=>t==null?Math.max(.18,a.weight*.9):e!=null&&e!==t?a.source===t&&a.target===e?.95:.08:a.source===t?Math.max(.35,a.weight):.08).attr("stroke-width",a=>t!=null&&e!=null&&a.source===t&&a.target===e?3.5:1+a.weight*4),d3.selectAll(".matrix-svg rect.adj-mat-square").attr("stroke",a=>a.row===t&&a.col===e?"#0f172a":a.row===t?"#334155":"#cbd5e1").attr("stroke-width",a=>a.row===t&&a.col===e?2.6:.6),d3.selectAll(".matrix-svg text.col-label").style("fill",a=>a.i===e?"#0f172a":"#475569").style("font-weight",a=>a.i===e?"700":"500"),d3.selectAll(".matrix-svg text.row-label").style("fill",a=>a.i===t?"#0f172a":"#475569").style("font-weight",a=>a.i===t?"700":"500")}function M(t,e,p,n,h){const a=d3.select(t);a.selectAll("*").remove();const b=e.length;if(!b)return;const i=Math.max(30,Math.min(44,Math.floor(320/b))),q={top:82,right:64,bottom:16,left:96},G=b*i;a.attr("width",q.left+G+q.right).attr("height",q.top+G+q.bottom);const d=a.append("g").attr("transform",`translate(${q.left}, ${q.top})`),T=[];let X=0;for(let o=0;o<b;o++)for(let w=0;w<b;w++){const Z=p[o][w];Z>X&&(X=Z),T.push({row:o,col:w,val:Z})}const z=X||1;d.selectAll("rect.adj-mat-square").data(T).enter().append("rect").attr("class","adj-mat-square").attr("x",o=>o.col*i).attr("y",o=>o.row*i).attr("width",i).attr("height",i).attr("fill",o=>o.val===0?"#f1f5f9":h).attr("fill-opacity",o=>o.val===0?1:.15+.85*(o.val/z)).attr("stroke","#cbd5e1").attr("stroke-width",.6).on("mouseenter",(o,w)=>{k.value||(R.value={i:w.row,j:w.col},E(w.row,w.col,!1))}).on("mouseleave",()=>{if(!k.value){const o=F(c.attention);R.value=o,E(o.i,o.j,!1)}}).on("click",(o,w)=>{k.value&&k.value.i===w.row&&k.value.j===w.col?(k.value=null,R.value={i:w.row,j:w.col},E(w.row,w.col,!1)):(k.value={i:w.row,j:w.col},E(w.row,w.col,!0))}),d.selectAll("text.cell-val").data(T).enter().append("text").attr("class","cell-val").attr("x",o=>o.col*i+i/2).attr("y",o=>o.row*i+i/2+4).attr("text-anchor","middle").style("font-size",i>=36?"10.5px":"9.5px").style("font-family","ui-monospace, SFMono-Regular, Menlo, monospace").style("font-weight","600").style("pointer-events","none").attr("fill",o=>o.val===0?"#94a3b8":.15+.85*(o.val/z)>.55?"#ffffff":"#0f172a").text(o=>o.val.toFixed(2));const U=e.map((o,w)=>({w:o,i:w}));d.selectAll("text.col-label").data(U).enter().append("text").attr("class","col-label").attr("transform",o=>`translate(${o.i*i+i/2+4}, -8) rotate(-45)`).attr("text-anchor","start").style("font-size","11.5px").style("fill","#475569").text(o=>o.w),d.selectAll("text.row-label").data(U).enter().append("text").attr("class","row-label").attr("x",-8).attr("y",o=>o.i*i+i/2+4).attr("text-anchor","end").style("font-size","11.5px").style("fill","#475569").text(o=>o.w),d.selectAll("text.row-sum").data(n.map((o,w)=>({s:o,i:w}))).enter().append("text").attr("class","row-sum").attr("x",G+8).attr("y",o=>o.i*i+i/2+4).style("font-size","10px").style("font-family","ui-monospace, Menlo, monospace").style("fill","#059669").text(o=>`Σ=${o.s.toFixed(2)}`)}function L(t,e){const p=d3.select("#token-graph-svg");p.selectAll("*").remove();const n=t.length;if(!n)return;const h=9.5,a=24,b=26,i=34,q=t.map((l,u)=>{const C=Math.max(58,Math.round(l.length*h+a));let N=0;for(let S=0;S<n;S++)S!==u&&e.gatAlpha[S][u]>N&&(N=e.gatAlpha[S][u]);return N===0&&(N=e.gatAlpha[u][u]),{word:l,i:u,boxW:C,maxIn:N}}),G=q.reduce((l,u)=>l+u.boxW,0)+Math.max(0,n-1)*b+48,d=Math.max(720,G);p.attr("width",d).attr("height",164);let X=Math.max(24,(d-(G-48))/2);const z=74;q.forEach(l=>{l.x=X,l.cx=X+l.boxW/2,X+=l.boxW+b}),p.append("defs").append("marker").attr("id","tg-arrow").attr("viewBox","0 -4 8 8").attr("refX",7).attr("refY",0).attr("markerWidth",5).attr("markerHeight",5).attr("orient","auto").append("path").attr("d","M0,-4L8,0L0,4Z").attr("fill","#2563eb");const o=[];for(let l=0;l<n;l++)for(let u=0;u<n;u++){if(l===u)continue;const C=e.gatAlpha[l][u];C>.04&&o.push({source:l,target:u,weight:C})}p.append("g").attr("class","arcs-layer").selectAll("path.attn-arc").data(o).enter().append("path").attr("class","attn-arc").attr("fill","none").attr("stroke","#2563eb").attr("marker-end","url(#tg-arrow)").attr("d",l=>{const u=q[l.source],C=q[l.target],N=Math.abs(u.cx-C.cx),S=Math.min(62,18+N*.18),he=l.source<l.target?z-S:z+i+S,ue=l.source<l.target?z:z+i,me=l.source<l.target?z-2:z+i+2;return`M ${u.cx} ${ue} Q ${(u.cx+C.cx)/2} ${he} ${C.cx} ${me}`});const w=p.append("g").attr("class","nodes-layer").selectAll("g.token-node-group").data(q).enter().append("g").attr("class","token-node-group").on("mouseenter",(l,u)=>{if(!k.value){let C=0,N=-1;for(let S=0;S<n;S++)e.gatAlpha[u.i][S]>N&&(N=e.gatAlpha[u.i][S],C=S);R.value={i:u.i,j:C},E(u.i,C,!1)}}).on("mouseleave",()=>{if(!k.value){const l=F(c.attention);R.value=l,E(l.i,l.j,!1)}});w.append("rect").attr("class","token-pill").attr("x",l=>l.x).attr("y",z).attr("width",l=>l.boxW).attr("height",i).attr("rx",8).attr("fill","#fef08a").attr("fill-opacity",l=>Math.min(1,.25+l.maxIn*1.4)).attr("stroke","#2563eb").attr("stroke-width",1.5),w.append("text").attr("x",l=>l.cx).attr("y",z+i/2+4.5).attr("text-anchor","middle").style("font-family","ui-monospace, SFMono-Regular, Menlo, monospace").style("font-size","13px").style("font-weight","600").attr("fill","#0f172a").text(l=>l.word);const Z=24;q.forEach(l=>{const u=e.embeddings[l.i];if(!u)return;const C=Math.min(u.length,64);let N=1/0,S=-1/0;for(let D=0;D<C;D++)u[D]<N&&(N=u[D]),u[D]>S&&(S=u[D]);const he=S-N||1,ue=l.boxW/Z,me=p.append("g");for(let D=0;D<Z;D++){const we=(u[Math.floor(D/Z*C)]-N)/he;me.append("rect").attr("x",l.x+D*ue).attr("y",z+i+6).attr("width",Math.max(1,ue-.3)).attr("height",7).attr("fill",`rgb(${Math.round(230*(1-we))}, ${Math.round(80+135*we)}, 245)`)}})}function F(t){if(!t)return{i:0,j:0};const e=t.gatAlpha.length;let p=0,n=e>1?1:0,h=-1;for(let a=0;a<e;a++)for(let b=0;b<e;b++)e>1&&a===b||t.gatAlpha[a][b]>h&&(h=t.gatAlpha[a][b],p=a,n=b);return{i:p,j:n}}function $(){const t=c.queryWords;if(!t.length)return;const e=_e(c.embeddings,{topology:B.value,temperature:K.value,eduSelfLoops:ee.value,numHeads:x.value,seed:W.value});if(c.attention=e,te.value=e.dim,L(t,e),M("#edu-matrix-svg",t,e.dotAlpha,e.eduRowSums,"#2563eb"),M("#gat-matrix-svg",t,e.gatAlpha,e.gatRowSums,"#dc2626"),!k.value||k.value.i>=t.length||k.value.j>=t.length){k.value=null;const p=F(e);R.value=p,E(p.i,p.j,!1)}else E(k.value.i,k.value.j,!0)}const fe=()=>{c.embeddings.length&&$()},J=()=>{f&&f.terminate();const t=new Blob([je],{type:"application/javascript"});f=new Worker(URL.createObjectURL(t),{type:"module"}),f.onerror=e=>{O.value=!1,P.value="error",_.value="Worker error (using synthetic baseline)",console.error("TextGraph worker error:",e)},f.onmessage=e=>{const{type:p,data:n}=e.data;if(p==="progress")O.value=!0,H.value=n.percent,P.value="",_.value=`Loading ${ge[y.value]?.label||"model"} (${n.percent}%)`;else if(p==="encoded"){if(n.requestId!==j)return;O.value=!1,H.value=100,P.value="ready",_.value=`${ge[n.modelId]?.label||n.modelId} (${n.backend.toUpperCase()})`,Y.value=`${n.dim}D contextualized token vectors`,c.embeddings=n.embeddings,$()}else p==="error"&&(O.value=!1,P.value="error",_.value=`Fallback to Synthetic: ${n.message}`)}},de=()=>{const t=ye(g.value);if(!t.length)return;if(c.queryWords=t,y.value==="synthetic"){O.value=!1,P.value="ready",_.value="Synthetic Baseline (64D Instant)",Y.value="64D deterministic vectors",c.embeddings=be(s.value,t),$();return}c.embeddings.length!==t.length&&(c.embeddings=be(s.value,t),$()),f||J(),j++,O.value=!0,H.value=0;const e=ge[y.value];P.value="",_.value=`Encoding with ${e.label}...`,f.postMessage({type:"encode",data:{requestId:j,modelId:y.value,meta:JSON.parse(JSON.stringify(e)),paragraphText:s.value,queryWords:JSON.parse(JSON.stringify(t))}})},xe=()=>{de()},Me=t=>{s.value=t.paragraph,g.value=t.query,de()};return We(()=>{window.addEventListener("beforeunload",()=>{f&&(f.terminate(),f=null)}),de()}),{isCvCopy:m,showRefs:v,presets:r,paragraphText:s,queryText:g,selectedModelId:y,topology:B,numHeads:x,gatSeed:W,temperature:K,eduSelfLoops:ee,workerLoading:O,workerProgress:H,statusKind:P,statusLabel:_,embInfo:Y,activeDim:te,pinnedCell:k,activeCell:se,queryTokensPreview:I,texDot:Q,texGat:le,katexInline:oe,canvasHSource:ae,canvasHTarget:re,canvasW:ne,canvasConcat:ie,canvasA:ce,recomputeMathOnly:fe,recomputeFromModel:de,onModelChange:xe,applyPreset:Me}}}).mount("#app");
