<template>
    <div class="markdown" v-html="html"></div>
</template>

<script lang="ts" setup>
import { marked } from 'marked'
import { ref, onMounted, useSlots } from 'vue'

const html = ref("")
const slots = useSlots()

onMounted(() => {
    const dft =  (slots as any).default as Function
    if (!dft) return
    const text = (slots as any).default()[0].children
    const lines:string[] = text.split("\n")
    while(lines.length > 0 && lines[0].trim().length === 0) lines.shift()
    while(lines.length > 0 && lines[lines.length -1 ].trim().length === 0) lines.pop()
    
    const minSpace = Math.min(...lines.filter(l => l.trim()).map((l:string) => l.length - l.trimStart().length))

    // Combine paragraphs
    let prevLine: number|null = null
    for(let i = 0; i < lines.length;)
    {
        let line = lines[i]
        line = line.substring(minSpace)

        // image loader
        if (line.trim().length === 0 || line.startsWith("#") || line.startsWith("*") || /^\d+\./.test(line) || /^=+$/.test(line) || line.startsWith("![") || line.startsWith("|"))
        {
            prevLine = null
            if(line.startsWith("![") && window.location.href.startsWith("http"))
            {
                line = line.replace("./assets/", "/src/assets/")
            }
            lines[i++] = line.trim()
            continue
        }

        // indent
        const space = line.length - line.trimStart().length
        if(space > 0 || prevLine === null) 
        {
            prevLine = i
            lines[i++] = line
            continue
        }
        
        // concat
        if(prevLine)
        {
            lines[prevLine] += line.trim()
            lines.splice(i, 1)
        }
        else
        {
            lines[i++] = line
        }
    }
    console.log(lines)
    html.value = marked.parse(lines.join("\n")) as unknown as string
    console.log(html.value)
})
</script>

<style lang="css">
.markdown{
    text-align: left
}
</style>